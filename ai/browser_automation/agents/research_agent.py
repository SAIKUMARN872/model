"""
Research-oriented browser agent.

This component handles deterministic browser
navigation and page collection. It does not
invent or fabricate research results.
"""

from __future__ import annotations

from typing import Any

from .browser_agent import (
    BrowserAgent,
)
from .utils import (
    build_result,
    clean_text,
    normalize_links,
)


class ResearchAgent(BrowserAgent):
    """
    Browser agent for collecting information
    from multiple web pages.
    """

    async def collect_page(
        self,
        url: str,
        extract_selector: str = "body",
    ) -> dict[str, Any]:

        try:

            if self.actions is None:

                raise RuntimeError(
                    "Browser is not started."
                )

            await self.actions.goto(
                url
            )

            if self.page is None:

                raise RuntimeError(
                    "Page is not available."
                )

            title = await self.page.title()

            locator = self.page.locator(
                extract_selector
            )

            text = await locator.inner_text()

            links = await self.page.locator(
                "a"
            ).evaluate_all(
                """
                elements => elements.map(
                    element => ({
                        title:
                            element.innerText || "",
                        url:
                            element.href || ""
                    })
                )
                """
            )

            return build_result(
                success=True,
                data={
                    "url": self.page.url,
                    "title": title,
                    "text": clean_text(
                        text
                    ),
                    "links": normalize_links(
                        links
                    ),
                },
            )

        except Exception as exc:

            return build_result(
                success=False,
                error=str(exc),
            )

    async def collect_pages(
        self,
        urls: list[str],
    ) -> dict[str, Any]:
        """
        Collect multiple pages sequentially.

        Sequential collection avoids opening
        uncontrolled numbers of browser tabs.
        """

        if not urls:

            raise ValueError(
                "urls cannot be empty."
            )

        results = []

        for url in urls:

            result = await self.collect_page(
                url
            )

            results.append(
                result
            )

        successful = [
            result
            for result in results
            if result["success"]
        ]

        failed = [
            result
            for result in results
            if not result["success"]
        ]

        return build_result(
            success=(
                len(failed) == 0
            ),
            data={
                "total": len(results),
                "successful": len(
                    successful
                ),
                "failed": len(
                    failed
                ),
                "results": results,
            },
        )

    async def find_links_containing(
        self,
        keyword: str,
    ) -> dict[str, Any]:

        try:

            if self.page is None:

                raise RuntimeError(
                    "Browser is not started."
                )

            keyword = keyword.lower()

            links = await self.page.locator(
                "a"
            ).evaluate_all(
                """
                elements => elements.map(
                    element => ({
                        title:
                            element.innerText || "",
                        url:
                            element.href || ""
                    })
                )
                """
            )

            matches = [
                link
                for link in links
                if keyword
                in (
                    link.get(
                        "title",
                        ""
                    )
                    + " "
                    + link.get(
                        "url",
                        ""
                    )
                ).lower()
            ]

            return build_result(
                success=True,
                data=normalize_links(
                    matches
                ),
            )

        except Exception as exc:

            return build_result(
                success=False,
                error=str(exc),
            )