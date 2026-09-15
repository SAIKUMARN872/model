"""
Web-page content extraction.
"""

from __future__ import annotations

from typing import Any

from .utils import (
    clean_text,
    unique_preserve_order,
)


class ContentExtractor:
    """
    Extracts readable content from a Playwright page.
    """

    def __init__(
        self,
        page: Any,
    ) -> None:

        if page is None:

            raise ValueError(
                "page is required."
            )

        self.page = page

    async def text(
        self,
        selector: str = "body",
    ) -> str:

        locator = self.page.locator(
            selector
        )

        value = await locator.inner_text()

        return clean_text(
            value
        )

    async def title(
        self,
    ) -> str:

        return clean_text(
            await self.page.title()
        )

    async def headings(
        self,
    ) -> list[str]:

        values = await self.page.locator(
            "h1, h2, h3, h4, h5, h6"
        ).all_inner_texts()

        return unique_preserve_order(
            [
                clean_text(value)
                for value in values
                if clean_text(value)
            ]
        )

    async def paragraphs(
        self,
    ) -> list[str]:

        values = await self.page.locator(
            "p"
        ).all_inner_texts()

        return [
            clean_text(value)
            for value in values
            if clean_text(value)
        ]

    async def lists(
        self,
    ) -> list[str]:

        values = await self.page.locator(
            "li"
        ).all_inner_texts()

        return [
            clean_text(value)
            for value in values
            if clean_text(value)
        ]

    async def links(
        self,
    ) -> list[dict[str, str]]:

        links = await self.page.locator(
            "a"
        ).evaluate_all(
            """
            elements => elements.map(
                element => ({
                    text:
                        element.innerText || "",
                    url:
                        element.href || ""
                })
            )
            """
        )

        result = []

        seen = set()

        for link in links:

            url = str(
                link.get(
                    "url",
                    ""
                )
            ).strip()

            if not url or url in seen:
                continue

            seen.add(url)

            result.append(
                {
                    "text": clean_text(
                        link.get(
                            "text",
                            ""
                        )
                    ),
                    "url": url,
                }
            )

        return result

    async def main_content(
        self,
    ) -> str:

        selectors = [
            "main",
            "article",
            "[role='main']",
            ".content",
            "#content",
            "body",
        ]

        for selector in selectors:

            try:

                locator = self.page.locator(
                    selector
                )

                if await locator.count() > 0:

                    text = await locator.first.inner_text()

                    text = clean_text(
                        text
                    )

                    if text:
                        return text

            except Exception:
                continue

        return ""

    async def html(
        self,
    ) -> str:

        return await self.page.content()