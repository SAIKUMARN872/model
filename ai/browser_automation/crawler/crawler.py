"""
Web crawler implementation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .queue import (
    CrawlItem,
    CrawlQueue,
)
from .utils import (
    extract_links,
    filter_links,
    get_domain,
    normalize_url,
)


@dataclass
class CrawlConfig:
    """Crawler configuration."""

    max_depth: int = 2

    max_pages: int = 100

    same_domain_only: bool = True

    allowed_domains: set[str] = field(
        default_factory=set
    )

    excluded_patterns: list[str] = field(
        default_factory=list
    )

    follow_links: bool = True

    wait_after_page: float = 0.0

    def __post_init__(self) -> None:

        if self.max_depth < 0:
            raise ValueError(
                "max_depth cannot be negative."
            )

        if self.max_pages <= 0:
            raise ValueError(
                "max_pages must be positive."
            )

        if self.wait_after_page < 0:
            raise ValueError(
                "wait_after_page cannot be negative."
            )


@dataclass
class CrawlPage:
    """Information collected from one page."""

    url: str

    depth: int

    title: str = ""

    text: str = ""

    links: list[str] = field(
        default_factory=list
    )

    success: bool = True

    error: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class WebCrawler:
    """
    Browser-based crawler.

    The supplied browser agent should provide methods such as:

        navigate()
        extract_page()

    and expose its Playwright page through
    the `page` attribute when link extraction is required.
    """

    def __init__(
        self,
        browser_agent: Any,
        config: CrawlConfig | None = None,
    ) -> None:

        if browser_agent is None:
            raise ValueError(
                "browser_agent is required."
            )

        self.browser_agent = (
            browser_agent
        )

        self.config = (
            config
            or CrawlConfig()
        )

        self.queue = CrawlQueue(
            max_size=self.config.max_pages
        )

        self.pages: list[
            CrawlPage
        ] = []

        self._start_domain: str | None = None

    async def crawl(
        self,
        start_url: str,
    ) -> list[CrawlPage]:
        """Start crawling from a URL."""

        start_url = normalize_url(
            start_url
        )

        self._reset()

        self._start_domain = get_domain(
            start_url
        )

        allowed_domains = set(
            self.config.allowed_domains
        )

        if (
            self.config.same_domain_only
            and not allowed_domains
        ):
            allowed_domains.add(
                self._start_domain
            )

        self.queue.put(
            CrawlItem(
                url=start_url,
                depth=0,
            )
        )

        while (
            not self.queue.empty()
            and len(self.pages)
            < self.config.max_pages
        ):

            item = self.queue.get()

            if item is None:
                break

            if self.queue.is_visited(
                item.url
            ):
                continue

            self.queue.mark_visited(
                item.url
            )

            page = await self._crawl_page(
                item
            )

            self.pages.append(
                page
            )

            if (
                page.success
                and self.config.follow_links
                and item.depth
                < self.config.max_depth
            ):

                links = filter_links(
                    page.links,
                    allowed_domains=(
                        allowed_domains
                        or None
                    ),
                    excluded_patterns=(
                        self.config.excluded_patterns
                    ),
                )

                for link in links:

                    if len(
                        self.pages
                    ) + self.queue.pending() >= (
                        self.config.max_pages
                    ):
                        break

                    self.queue.put(
                        CrawlItem(
                            url=link,
                            depth=item.depth + 1,
                            parent_url=item.url,
                        )
                    )

            if self.config.wait_after_page:

                import asyncio

                await asyncio.sleep(
                    self.config.wait_after_page
                )

        return list(
            self.pages
        )

    async def _crawl_page(
        self,
        item: CrawlItem,
    ) -> CrawlPage:

        try:

            result = (
                await self.browser_agent.navigate(
                    item.url
                )
            )

            if not result.get(
                "success",
                False,
            ):

                return CrawlPage(
                    url=item.url,
                    depth=item.depth,
                    success=False,
                    error=result.get(
                        "error",
                        "Navigation failed",
                    ),
                )

            title = (
                result.get(
                    "data",
                    {}
                ).get(
                    "title",
                    "",
                )
            )

            text = ""

            page = getattr(
                self.browser_agent,
                "page",
                None,
            )

            links: list[str] = []

            if page is not None:

                text_result = (
                    await page.locator(
                        "body"
                    ).inner_text()
                )

                text = text_result.strip()

                raw_links = (
                    await page.locator(
                        "a"
                    ).evaluate_all(
                        """
                        elements => elements.map(
                            element => element.href || ""
                        )
                        """
                    )
                )

                links = []

                for link in raw_links:

                    try:

                        normalized = normalize_url(
                            link,
                            item.url,
                        )

                        if normalized not in links:
                            links.append(
                                normalized
                            )

                    except ValueError:
                        continue

            return CrawlPage(
                url=item.url,
                depth=item.depth,
                title=title,
                text=text,
                links=links,
                success=True,
                metadata={
                    "domain": get_domain(
                        item.url
                    ),
                    "parent_url": (
                        item.parent_url
                    ),
                },
            )

        except Exception as exc:

            return CrawlPage(
                url=item.url,
                depth=item.depth,
                success=False,
                error=str(exc),
            )

    def _reset(
        self,
    ) -> None:

        self.queue.clear()
        self.pages.clear()
        self._start_domain = None

    def statistics(
        self,
    ) -> dict[str, Any]:

        successful = sum(
            1
            for page in self.pages
            if page.success
        )

        failed = len(
            self.pages
        ) - successful

        return {
            "pages": len(
                self.pages
            ),
            "successful": successful,
            "failed": failed,
            "visited": (
                self.queue.visited_count()
            ),
            "pending": (
                self.queue.pending()
            ),
            "max_depth": (
                self.config.max_depth
            ),
        }