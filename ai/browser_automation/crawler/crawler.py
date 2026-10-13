from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
from urllib.parse import urldefrag

from ..schemas import validate_url
from ..exceptions import BrowserActionError


@dataclass
class CrawlResult:
    url: str
    title: str = ""
    text: str = ""
    links: list[str] = field(default_factory=list)
    error: str | None = None


class BrowserCrawler:
    """Crawl public HTTP(S) pages using a Playwright-compatible page."""

    def __init__(
        self,
        page: Any,
        max_pages: int = 25,
        max_links_per_page: int = 100,
    ) -> None:
        if page is None:
            raise ValueError("A browser page is required.")
        if max_pages < 1 or max_links_per_page < 1:
            raise ValueError("Crawl limits must be positive integers.")

        self.page = page
        self.max_pages = max_pages
        self.max_links_per_page = max_links_per_page

    async def crawl_page(self, url: str) -> CrawlResult:
        safe_url = validate_url(url)

        try:
            await self.page.goto(
                safe_url,
                wait_until="domcontentloaded",
                timeout=15000,
            )
            title = await self.page.title()
            text = await self.page.locator("body").inner_text(timeout=5000)

            raw_links = await self.page.locator("a[href]").evaluate_all(
                "(elements) => elements.map((element) => element.href)"
            )

            links: list[str] = []
            seen: set[str] = set()

            for raw_link in raw_links:
                if not isinstance(raw_link, str):
                    continue

                try:
                    candidate = validate_url(raw_link)
                except Exception:
                    continue

                candidate, _fragment = urldefrag(candidate)
                if candidate not in seen:
                    seen.add(candidate)
                    links.append(candidate)

                if len(links) >= self.max_links_per_page:
                    break

            return CrawlResult(
                url=safe_url,
                title=str(title or ""),
                text=str(text or ""),
                links=links,
            )
        except Exception as exc:
            raise BrowserActionError(
                f"Failed to crawl page {safe_url}: {exc}"
            ) from exc

    async def crawl(self, start_url: str) -> list[CrawlResult]:
        start_url = validate_url(start_url)
        queue = [start_url]
        visited: set[str] = set()
        results: list[CrawlResult] = []
        start_host = self._host(start_url)

        while queue and len(results) < self.max_pages:
            url = queue.pop(0)
            url, _fragment = urldefrag(url)

            if url in visited:
                continue
            visited.add(url)

            if self._host(url) != start_host:
                continue

            try:
                result = await self.crawl_page(url)
            except BrowserActionError as exc:
                results.append(CrawlResult(url=url, error=str(exc)))
                continue

            results.append(result)

            for link in result.links:
                if link not in visited and self._host(link) == start_host:
                    queue.append(link)

        return results

    @staticmethod
    def _host(url: str) -> str:
        from urllib.parse import urlsplit

        parsed = urlsplit(validate_url(url))
        return (parsed.hostname or "").lower()
