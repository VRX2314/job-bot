from fastapi import FastAPI, HTTPException
from datetime import datetime
from playwright.async_api import async_playwright
import os
from fastapi.responses import StreamingResponse
import json
from agents import CondensorAgent, EvaluatorAgent, CondensorEvaluatorGraph
from temp import temporary_job, temporary_resume
from langsmith import Client
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

groq_key = os.getenv("GROQ_API_KEY")
langsmith_key = os.getenv("LANGSMITH_API_KEY")

os.system("export LANGCHAIN_TRACING_V2=true")

model = ChatGroq(
    model="llama-3.1-70b-versatile",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)

client = Client()

app = FastAPI()


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


class LLMCrawler(Crawler):
    def __init__(self, config, model, resume):
        super().__init__(config)
        self.condensor = CondensorAgent(model)
        self.evaluator = EvaluatorAgent(model, resume)
        self.condensor_evaluator_graph = CondensorEvaluatorGraph(
            self.condensor, self.evaluator
        )

    async def scrape(self):
        async with async_playwright() as p:
            ctx = 0
            await self._load_browser(p)
            await self._load_page()

            for _ in range(self.pages):
                job_elements = await self.page.query_selector_all(
                    ".jobTitle.css-198pbd.eu4oa1w0"
                )

                for job in job_elements:
                    scraped_job = await self.scrape_indeed(job)
                    response = self.condensor_evaluator_graph.execute_graph(
                        f"{scraped_job}"
                    )

                    yield response
                    ctx += 1
                    if ctx > 3:
                        break

                    if self.pages > 1:
                        next_button = await self.page.query_selector(
                            'a[data-testid="pagination-page-next"]'
                        )
                        if next_button:
                            await next_button.click()
                            await self.page.wait_for_timeout(5000)
                        else:
                            break


@app.get("/stream-llm")
async def stream_llm():
    config_path = "./config/config.json"
    if os.path.exists(config_path):
        with open(config_path, "r") as file:
            config = json.load(file)
        print("Config loaded:", config)
    else:
        print(f"Config file {config_path} does not exist.")
    crawler = LLMCrawler(config, model, temporary_resume())

    return StreamingResponse(crawler.scrape(), media_type="text/event-stream")
