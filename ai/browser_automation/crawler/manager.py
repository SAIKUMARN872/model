from __future__ import annotations

from typing import Any

from .crawler import BrowserCrawler, CrawlResult


class CrawlerManager:
    """Manage bounded crawl jobs and retain their results."""

    def __init__(self, page: Any, max_pages: int = 25) -> None:
        self.crawler = BrowserCrawler(page=page, max_pages=max_pages)
        self.results: dict[str, list[CrawlResult]] = {}

    async def run(self, job_id: str, start_url: str) -> list[CrawlResult]:
        if not isinstance(job_id, str) or not job_id.strip():
            raise ValueError("A non-empty crawl job ID is required.")
        if job_id in self.results:
            raise ValueError(f"Crawl job already exists: {job_id}")

        results = await self.crawler.crawl(start_url)
        self.results[job_id] = results
        return results

    def get_results(self, job_id: str) -> list[CrawlResult]:
        return list(self.results.get(job_id, []))

    def remove(self, job_id: str) -> bool:
        return self.results.pop(job_id, None) is not None
