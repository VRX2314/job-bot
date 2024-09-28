import numpy as np

from crawler import Crawler
from agents import CondensorAgent, EvaluatorAgent, CondensorEvaluatorGraph, HybridAgent
from playwright.async_api import async_playwright
from warnings import filterwarnings

from temp import temporary_resume

from langchain_groq import ChatGroq
import asyncio

from tqdm import tqdm
filterwarnings('ignore')



class LLMCrawler(Crawler):
    def __init__(self, query, location, model, resume):
        super().__init__(query, location)
        self.condensor = CondensorAgent(model)
        self.evaluator = EvaluatorAgent(model, resume)
        self.hybrid = HybridAgent(model, resume)
        self.condensor_evaluator_graph = CondensorEvaluatorGraph(
            self.condensor, self.evaluator, self.hybrid
        )

    async def scrape(self, hybrid: bool = True):
        async with async_playwright() as p:
            ctx = 0
            await self._load_browser(p)
            await self._load_page()
            
            len_listings = 3

            while len_listings != ctx:
                job_elements = await self.page.query_selector_all(
                    ".jobTitle.css-198pbd.eu4oa1w0"
                )
                
                for job in tqdm(job_elements):
                    scraped_job = await self.scrape_indeed(job)
                    if hybrid:
                        response = self.condensor_evaluator_graph.execute_hybrid_graph(
                            f"{scraped_job}"
                        )
                    else:
                        response = self.condensor_evaluator_graph.execute_graph(
                            f"{scraped_job}"
                        )
                    # ctx += 1
                    # if ctx > 2:
                    #     break
                    yield f"{response}"
                    await asyncio.sleep(np.random.choice(np.arange(1,3, 0.5)))
                    ctx += 1
                    if len_listings == ctx:
                        print(len_listings)
                        break

                next_button = await self.page.query_selector(
                    'a[data-testid="pagination-page-next"]'
                )
                if next_button:
                    await next_button.click()
                    await self.page.wait_for_timeout(5000)
                else:
                    break

    