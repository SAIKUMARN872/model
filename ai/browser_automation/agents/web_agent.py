"""
Web navigation and extraction agent.
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


class WebAgent(BrowserAgent):
    """
    Agent specialized for web-page navigation,
    extraction and link discovery.
    """

    async def open(
        self,
        url: str,
    ) -> dict[str, Any]:

        return await self.navigate(
            url
        )

    async def extract(
        self,
        selector: str = "body",
    ) -> dict[str, Any]:
        """Extract text from a selector."""

        try:

            if self.page is None:

                raise RuntimeError(
                    "Browser is not started."
                )

            locator = self.page.locator(
                selector
            )

            text = await locator.inner_text()

            return build_result(
                success=True,
                data={
                    "selector": selector,
                    "text": clean_text(
                        text
                    ),
                },
            )

        except Exception as exc:

            return build_result(
                success=False,
                error=str(exc),
            )

    async def get_links(
        self,
        selector: str = "a",
    ) -> dict[str, Any]:
        """Extract links from the current page."""

        try:

            if self.page is None:

                raise RuntimeError(
                    "Browser is not started."
                )

            links = await self.page.locator(
                selector
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
                data=normalize_links(
                    links
                ),
            )

        except Exception as exc:

            return build_result(
                success=False,
                error=str(exc),
            )

    async def get_page_metadata(
        self,
    ) -> dict[str, Any]:

        try:

            if self.page is None:

                raise RuntimeError(
                    "Browser is not started."
                )

            metadata = await self.page.evaluate(
                """
                () => {
                    const getMeta = name => {
                        const element =
                            document.querySelector(
                                `meta[name="${name}"]`
                            );
                        return element
                            ? element.content
                            : "";
                    };

                    return {
                        title: document.title,
                        description:
                            getMeta("description"),
                        keywords:
                            getMeta("keywords"),
                        url: location.href
                    };
                }
                """
            )

            return build_result(
                success=True,
                data=metadata,
            )

        except Exception as exc:

            return build_result(
                success=False,
                error=str(exc),
            )

    async def search_text(
        self,
        text: str,
    ) -> dict[str, Any]:

        try:

            if self.page is None:

                raise RuntimeError(
                    "Browser is not started."
                )

            body = await self.page.locator(
                "body"
            ).inner_text()

            found = (
                text.lower()
                in body.lower()
            )

            return build_result(
                success=True,
                data={
                    "query": text,
                    "found": found,
                },
            )

        except Exception as exc:

            return build_result(
                success=False,
                error=str(exc),
            )