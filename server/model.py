from crawler import Crawler
from agents import CondensorAgent, EvaluatorAgent, CondensorEvaluatorGraph
from playwright.async_api import async_playwright


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

                    yield f"{response}"

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
