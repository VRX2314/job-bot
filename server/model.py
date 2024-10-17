import json
import numpy as np
import httpx

from crawler import Crawler
from agents import CondenserAgent, EvaluatorAgent, CondenserEvaluatorGraph, HybridAgent
from playwright.async_api import async_playwright
import asyncio

from mongo_db_utils import mongo_insert_job

class LLMCrawler(Crawler):
    def __init__(self, query, location, listings, model, resume):
        super().__init__(query, location, listings)
        # TODO: Implement Langgraph to make dynamic
        self.condenser = CondenserAgent(model)
        self.evaluator = EvaluatorAgent(model, resume)
        self.hybrid = HybridAgent(model, resume)
        self.condenser_evaluator_graph = CondenserEvaluatorGraph(
            self.condenser, self.evaluator, self.hybrid
        )

    # Headed Scraper - A feature of the future :D
    async def scrape(self, hybrid: bool = True):
        async with async_playwright() as p:
            ctx = 0
            await self._load_browser(p)
            await self._load_page()

            # TODO: Refactor with better logic
            while self.listings != ctx:
                job_elements = await self.page.query_selector_all(
                    ".jobTitle.css-198pbd.eu4oa1w0"
                )

                for job in job_elements:
                    scraped_job = await self.scrape_indeed(job)
                    if hybrid:
                        response = self.condenser_evaluator_graph.execute_hybrid_graph(
                            f"{scraped_job}"
                        )

                        # Adding job_title, company, link to scraped response
                        response["job_title"] = scraped_job["Title"][:scraped_job["Title"].index("\n")]
                        response["company"] = scraped_job["Company"]
                        response["link"] = scraped_job["Link"]
                        response["date"] = scraped_job["Date"]
                    else:
                        response = self.condenser_evaluator_graph.execute_graph(
                            f"{scraped_job}"
                        )

                        # Adding job_title, company, link to scraped response
                        response["job_title"] = scraped_job["Title"][:scraped_job["Title"].index("\n")]
                        response["company"] = scraped_job["Company"]
                        response["link"] = scraped_job["Link"]
                        response["date"] = scraped_job["Date"]

                    # TODO: Handle Gemma ```json ... ```
                    yield json.dumps(response, indent=2)  # Needs to be yielded as string for streaming

                    # Adding randomness to avoid bot-detection
                    await asyncio.sleep(np.random.choice(np.arange(1, 3, 0.01)))

                    ctx += 1
                    if self.listings == ctx:
                        break

                next_button = await self.page.query_selector(
                    'a[data-testid="pagination-page-next"]'
                )
                if next_button:
                    await next_button.click()
                    await self.page.wait_for_timeout(5000)
                else:
                    break

    async def infer(self, jobs):
        async with httpx.AsyncClient() as client:
            for idx in range(len(jobs)):
                description = jobs["description"].iloc[idx]

                try:
                    response = self.condenser_evaluator_graph.execute_hybrid_graph(prompt=description)
                except Exception as e:
                    print(e)
                    break

                response["job_title"] = jobs["title"].iloc[idx]
                response["company"] = jobs["company"].iloc[idx]
                response["id"] = jobs["id"].iloc[idx]
                response["link"] = jobs["job_url"].iloc[idx]
                response["date"] = jobs["date_posted"].iloc[idx].strftime("%d-%m-%Y")

                response_data_entry = {key: response[key] for key in
                                       response.keys() & {"id", "job_title", "company", "link", "date"}}

                try:
                    response_db = await client.post("http://localhost:8000/mongo-insert-job", json=response_data_entry)
                except Exception as e:
                    print("Error: ", e)

            yield json.dumps(response, indent=2)
            await asyncio.sleep(0.25)