from crawler import Crawler
from agents import CondenserAgent, EvaluatorAgent, CondenserEvaluatorGraph, HybridAgent
from playwright.async_api import async_playwright


class LLMCrawler(Crawler):
    def __init__(self, query, location, listings, model, resume):
        super().__init__(query, location, listings)
        self.condenser = CondenserAgent(model)
        self.evaluator = EvaluatorAgent(model, resume)
        self.hybrid = HybridAgent(model, resume)
        self.condenser_evaluator_graph = CondenserEvaluatorGraph(
            self.condenser, self.evaluator, self.hybrid
        )

    async def scrape(self, hybrid: bool = False):
        async with async_playwright() as p:
            ctx = 0
            await self._load_browser(p)
            await self._load_page()

            job_elements = await self.page.query_selector_all(
                ".jobTitle.css-198pbd.eu4oa1w0"
            )

            for job in job_elements:
                scraped_job = await self.scrape_indeed(job)
                if hybrid:
                    response = self.condenser_evaluator_graph.execute_hybrid_graph(
                        f"{scraped_job}"
                    )
                else:
                    response = self.condenser_evaluator_graph.execute_graph(
                        f"{scraped_job}"
                    )

                yield f"{response}"

                ctx += 1
                if ctx > self.listings - 1:
                    break
