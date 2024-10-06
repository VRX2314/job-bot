import asyncio
import json
from datetime import datetime, timedelta

import re
from textwrap import indent

from playwright.async_api import async_playwright
import numpy as np


# ! Scraper Branch
class Crawler:
    def __init__(self, query, location, listings):
        self.browser = None
        self.page = None

        self.query = query
        self.listings = listings  # TODO Make Dynamic
        self.location = location

        self.today = datetime.today().date()

    def convert_posting_time(self, posting_time_str):
        # Check if the posting time contains "Just posted"
        if "Just posted" in posting_time_str:
            return datetime.now().strftime("%Y-%m-%d")  # Return today's date

        # Use regex to find the number of days ago
        match = re.search(r'Posted (\d+) days ago', posting_time_str)
        if match:
            days_ago = int(match.group(1))  # Extract the number of days
            posting_date = datetime.now() - timedelta(days=days_ago)  # Subtract days from current date
            return posting_date.strftime("%d-%m-%Y")  #

    async def _load_page(self):
        await self.page.goto("https://in.indeed.com/")
        await self.page.wait_for_selector("input#text-input-what")
        await self.page.fill("input#text-input-what", self.query)
        await self.page.fill("input#text-input-where", self.location)
        await self.page.click("button.yosegi-InlineWhatWhere-primaryButton")

        await self.page.click("span#dateLabel")
        # Close modal if it appears
        await self._close_modal()
        await self.page.wait_for_timeout(1000)

    async def _close_modal(self):
        try:
            # Wait for the modal to appear and then close it
            await self.page.wait_for_selector("#mosaic-desktopserpjapopup", timeout=5000)
            close_button = await self.page.query_selector("button[aria-label='close']")
            if close_button:
                await asyncio.sleep(np.random.choice(np.arange(1, 2, 0.0001)))
                await close_button.click()
                print("Modal closed.")
        except Exception as e:
            print("No modal appeared or failed to close:", str(e))

    async def _load_browser(self, p):
        self.browser = await p.chromium.launch(headless=False)
        self.page = await self.browser.new_page()

    async def scrape_indeed(self, job) -> dict:
        await job.click(timeout=30000)
        await self.page.wait_for_selector(
            "h2.jobsearch-JobInfoHeader-title", timeout=5000
        )

        job_title_element = await self.page.query_selector(
            "h2.jobsearch-JobInfoHeader-title"
        )
        job_title = await job_title_element.inner_text() if job_title_element else "N/A"

        company_name_element = await self.page.query_selector(
            'div[data-company-name="true"]'
        )
        company_name = (
            await company_name_element.inner_text() if company_name_element else "N/A"
        )

        location_element = await self.page.query_selector(
            'div[data-testid="inlineHeader-companyLocation"]'
        )
        location = await location_element.inner_text() if location_element else "N/A"

        job_description_element = await self.page.query_selector(
            "div.jobsearch-JobComponent-description"
        )
        job_description = (
            await job_description_element.inner_text()
            if job_description_element
            else None
        )

        posting_time_element = await self.page.query_selector('span[data-testid="myJobsStateDate"]')
        posting_time_str = await posting_time_element.inner_text() if posting_time_element else "N/A"
        posting_date = self.convert_posting_time(posting_time_str=posting_time_str)

        return {
            "Title": job_title,
            "Company": company_name,
            "Location": location,
            "Description": job_description,
            "Link": self.page.url,
            "Date": posting_date
        }

    async def scrape_indeed_self(self):
        async with async_playwright() as p:
            await self._load_browser(p)
            await self._load_page()
            counter = 0

            while counter < self.listings:
                job_elements = await self.page.query_selector_all(
                    ".jobTitle.css-198pbd.eu4oa1w0"
                )

                for job in job_elements:
                    scraped_job = await self.scrape_indeed(job)

                    yield json.dumps(scraped_job, indent=2)  # dict -> str to stream

                    # Simulating randomness to avoid bot detection
                    await asyncio.sleep(np.random.choice(np.arange(1, 3, 0.0001)))

                    counter += 1
                    if self.listings == counter:
                        break

                # Page navigation
                next_button = await self.page.query_selector(
                    'a[data-testid="pagination-page-next"]'
                )
                if next_button:
                    await next_button.click()
                    await self.page.wait_for_timeout(5000)
                else:
                    break
