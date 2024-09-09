from datetime import datetime


class Crawler:
    def __init__(self, config):
        self.browser = None
        self.page = None

        self.query = config["query"]
        self.pages = config["pages"]
        self.location = config["location"]

        self.today = datetime.today().date()

    async def _load_page(self):
        await self.page.goto("https://in.indeed.com/")
        await self.page.wait_for_selector("input#text-input-what")
        await self.page.fill("input#text-input-what", self.query)
        await self.page.fill("input#text-input-where", self.location)
        await self.page.click("button.yosegi-InlineWhatWhere-primaryButton")

        await self.page.click("span#dateLabel")
        await self.page.wait_for_timeout(2000)

    async def _load_browser(self, p):
        self.browser = await p.chromium.launch(headless=False)
        self.page = await self.browser.new_page()

    async def scrape_indeed(self, job) -> dict:
        await job.click(timeout=120000)
        await self.page.wait_for_timeout(5000)

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

        scraped = {
            "Title": job_title,
            "Company": company_name,
            "Location": location,
            "Description": job_description,
        }

        return scraped
