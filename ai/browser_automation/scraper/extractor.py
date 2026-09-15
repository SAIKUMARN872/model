"""
Browser page content extractor.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .parser import (
    HTMLDocumentParser,
    ParsedHTML,
)
from .utils import (
    absolute_url,
    clean_text,
    unique_items,
)


@dataclass
class ScrapedContent:
    """Structured content extracted from a page."""

    url: str

    title: str = ""

    text: str = ""

    headings: list[str] = field(
        default_factory=list
    )

    links: list[str] = field(
        default_factory=list
    )

    images: list[str] = field(
        default_factory=list
    )

    metadata: dict[str, str] = field(
        default_factory=dict
    )

    word_count: int = 0

    success: bool = True

    error: str | None = None

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "url": self.url,
            "title": self.title,
            "text": self.text,
            "headings": self.headings,
            "links": self.links,
            "images": self.images,
            "metadata": self.metadata,
            "word_count": self.word_count,
            "success": self.success,
            "error": self.error,
        }


class PageExtractor:
    """
    Extracts structured content from a Playwright page.

    Works with a Playwright Page object.
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

    async def extract(
        self,
        include_links: bool = True,
        include_images: bool = True,
    ) -> ScrapedContent:

        url = getattr(
            self.page,
            "url",
            "",
        )

        try:

            title = await self._title()

            text = await self._text()

            headings = (
                await self._headings()
            )

            links = (
                await self._links()
                if include_links
                else []
            )

            images = (
                await self._images()
                if include_images
                else []
            )

            metadata = (
                await self._metadata()
            )

            return ScrapedContent(
                url=url,
                title=title,
                text=text,
                headings=headings,
                links=links,
                images=images,
                metadata=metadata,
                word_count=len(
                    text.split()
                ),
                success=True,
            )

        except Exception as exc:

            return ScrapedContent(
                url=url,
                success=False,
                error=str(exc),
            )

    async def _title(
        self,
    ) -> str:

        return clean_text(
            await self.page.title()
        )

    async def _text(
        self,
    ) -> str:

        selectors = [
            "main",
            "article",
            "[role='main']",
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

    async def _headings(
        self,
    ) -> list[str]:

        values = await self.page.locator(
            "h1, h2, h3, h4, h5, h6"
        ).all_inner_texts()

        return unique_items(
            [
                clean_text(value)
                for value in values
                if clean_text(value)
            ]
        )

    async def _links(
        self,
    ) -> list[str]:

        values = await self.page.locator(
            "a"
        ).evaluate_all(
            """
            elements =>
                elements.map(
                    element =>
                        element.href || ""
                )
            """
        )

        result = []

        for value in values:

            try:

                if not value:
                    continue

                result.append(
                    absolute_url(
                        value,
                        self.page.url,
                    )
                )

            except (
                ValueError,
                TypeError,
            ):

                continue

        return unique_items(
            result
        )

    async def _images(
        self,
    ) -> list[str]:

        values = await self.page.locator(
            "img"
        ).evaluate_all(
            """
            elements =>
                elements.map(
                    element =>
                        element.src || ""
                )
            """
        )

        result = []

        for value in values:

            try:

                if not value:
                    continue

                result.append(
                    absolute_url(
                        value,
                        self.page.url,
                    )
                )

            except (
                ValueError,
                TypeError,
            ):

                continue

        return unique_items(
            result
        )

    async def _metadata(
        self,
    ) -> dict[str, str]:

        return await self.page.evaluate(
            """
            () => {
                const result = {};

                document
                    .querySelectorAll("meta")
                    .forEach(meta => {
                        const key =
                            meta.name ||
                            meta.getAttribute(
                                "property"
                            );

                        const value =
                            meta.content;

                        if (key && value) {
                            result[key] = value;
                        }
                    });

                return result;
            }
            """
        )

    async def html(
        self,
    ) -> str:

        return await self.page.content()

    async def parse_html(
        self,
    ) -> ParsedHTML:

        html = await self.html()

        parser = HTMLDocumentParser()

        return parser.parse(
            html
        )