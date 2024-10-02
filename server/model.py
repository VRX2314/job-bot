import json
import numpy as np
from crawler import Crawler
from agents import CondenserAgent, EvaluatorAgent, CondenserEvaluatorGraph, HybridAgent
from playwright.async_api import async_playwright
from warnings import filterwarnings
from temp import temporary_resume
from langchain_groq import ChatGroq
import asyncio

class LLMCrawler(Crawler):
    def __init__(self, query, location, listings,  model, resume):
        super().__init__(query, location, listings)
        self.condenser = CondenserAgent(model)
        self.evaluator = EvaluatorAgent(model, resume)
        self.hybrid = HybridAgent(model, resume)
        self.condenser_evaluator_graph = CondenserEvaluatorGraph(
            self.condenser, self.evaluator, self.hybrid
        )

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
                    yield json.dumps(response, indent=2) # Needs to be yielded as string for streaming

                    # Adding randomness to avoid bot-detection
                    await asyncio.sleep(np.random.choice(np.arange(1,3, 0.01)))

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

    