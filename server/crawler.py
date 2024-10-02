from datetime import datetime, timedelta

import re


#! Scraper Branch
class Crawler:
    def __init__(self, query, location, listings):
        self.browser = None
        self.page = None

        self.query = query
        self.listings = listings  # TODO Make Dynamic
        self.location = location

        self.today = datetime.today().date()
        
    def convert_posting_time(self,posting_time_str):
    # Check if the posting time contains "Just posted"
        if "Just posted" in posting_time_str:
            return datetime.now().strftime("%Y-%m-%d")  # Return today's date
        
        # Use regex to find the number of days ago
        match = re.search(r'Posted (\d+) days ago', posting_time_str)
        if match:
            days_ago = int(match.group(1))  # Extract the number of days
            posting_date = datetime.now() - timedelta(days=days_ago)  # Subtract days from current date
            return posting_date.strftime("%Y-%m-%d")  #

    async def _load_page(self):
        await self.page.goto("https://in.indeed.com/")
        await self.page.wait_for_selector("input#text-input-what")
        await self.page.fill("input#text-input-what", self.query)
        await self.page.fill("input#text-input-where", self.location)
        await self.page.click("button.yosegi-InlineWhatWhere-primaryButton")

        await self.page.click("span#dateLabel")
        await self.page.wait_for_timeout(1000)

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
        posting_date  = self.convert_posting_time(posting_time_str=posting_time_str)

        return {
            "Title": job_title,
            "Company": company_name,
            "Location": location,
            "Description": job_description,
            "Link": self.page.url,
            "Posting Date": posting_date
        }
