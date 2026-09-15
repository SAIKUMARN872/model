"""
High-level browser scraper.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any

from .extractor import (
    PageExtractor,
    ScrapedContent,
)
from .utils import (
    get_domain,
    normalize_url,
)


@dataclass
class ScraperConfig:
    """Scraper configuration."""

    timeout: int = 30000

    wait_until: str = (
        "domcontentloaded"
    )

    delay: float = 0.0

    max_content_length: int = 1_000_000

    allowed_domains: set[str] | None = None

    same_domain_only: bool = False

    def __post_init__(self) -> None:

        if self.timeout <= 0:

            raise ValueError(
                "timeout must be positive."
            )

        if self.delay < 0:

            raise ValueError(
                "delay cannot be negative."
            )

        if self.max_content_length <= 0:

            raise ValueError(
                "max_content_length must be positive."
            )


class WebScraper:
    """
    High-level web scraper.

    Uses an existing browser driver/page.
    """

    def __init__(
        self,
        browser: Any,
        config: ScraperConfig | None = None,
    ) -> None:

        if browser is None:

            raise ValueError(
                "browser is required."
            )

        self.browser = browser

        self.config = (
            config
            or ScraperConfig()
        )

    @property
    def page(self) -> Any:

        page = getattr(
            self.browser,
            "page",
            None,
        )

        if page is None:

            raise RuntimeError(
                "Browser does not have an active page."
            )

        return page

    async def scrape(
        self,
        url: str,
    ) -> ScrapedContent:

        url = normalize_url(
            url
        )

        self._validate_domain(
            url
        )

        try:

            await self.page.goto(
                url,
                wait_until=(
                    self.config.wait_until
                ),
                timeout=(
                    self.config.timeout
                ),
            )

            if self.config.delay:

                await asyncio.sleep(
                    self.config.delay
                )

            extractor = PageExtractor(
                self.page
            )

            result = await extractor.extract()

            if (
                len(result.text)
                > self.config.max_content_length
            ):

                result.text = (
                    result.text[
                        : self.config.max_content_length
                    ]
                    + "..."
                )

            return result

        except Exception as exc:

            return ScrapedContent(
                url=url,
                success=False,
                error=str(exc),
            )

    async def scrape_many(
        self,
        urls: list[str],
    ) -> list[ScrapedContent]:

        results = []

        for url in urls:

            results.append(
                await self.scrape(
                    url
                )
            )

        return results

    async def title(
        self,
        url: str,
    ) -> str:

        result = await self.scrape(
            url
        )

        return result.title

    async def text(
        self,
        url: str,
    ) -> str:

        result = await self.scrape(
            url
        )

        return result.text

    def _validate_domain(
        self,
        url: str,
    ) -> None:

        domain = get_domain(
            url
        )

        allowed = (
            self.config.allowed_domains
        )

        if allowed:

            normalized = {
                item.lower().strip()
                for item in allowed
            }

            if domain not in normalized:

                raise PermissionError(
                    f"Domain '{domain}' is not allowed."
                )