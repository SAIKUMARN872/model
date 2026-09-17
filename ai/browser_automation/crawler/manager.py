"""
Crawler manager.
"""

from __future__ import annotations

from typing import Any

from .crawler import (
    CrawlConfig,
    CrawlPage,
    WebCrawler,
)


class CrawlerManager:
    """
    Manages multiple crawler instances.
    """

    def __init__(self) -> None:

        self._crawlers: dict[
            str,
            WebCrawler,
        ] = {}

    def register(
        self,
        name: str,
        crawler: WebCrawler,
        overwrite: bool = False,
    ) -> None:

        name = name.strip().lower()

        if not name:
            raise ValueError(
                "Crawler name cannot be empty."
            )

        if (
            name in self._crawlers
            and not overwrite
        ):

            raise ValueError(
                f"Crawler '{name}' already exists."
            )

        self._crawlers[
            name
        ] = crawler

    def create(
        self,
        name: str,
        browser_agent: Any,
        config: CrawlConfig | None = None,
    ) -> WebCrawler:

        crawler = WebCrawler(
            browser_agent,
            config,
        )

        self.register(
            name,
            crawler,
        )

        return crawler

    def get(
        self,
        name: str,
    ) -> WebCrawler:

        name = name.strip().lower()

        if name not in self._crawlers:

            raise KeyError(
                f"Crawler '{name}' not found."
            )

        return self._crawlers[
            name
        ]

    def remove(
        self,
        name: str,
    ) -> WebCrawler | None:

        return self._crawlers.pop(
            name.strip().lower(),
            None,
        )

    def names(
        self,
    ) -> list[str]:

        return list(
            self._crawlers.keys()
        )

    async def crawl(
        self,
        name: str,
        start_url: str,
    ) -> list[CrawlPage]:

        crawler = self.get(
            name
        )

        return await crawler.crawl(
            start_url
        )

    def statistics(
        self,
        name: str,
    ) -> dict[str, Any]:

        return self.get(
            name
        ).statistics()