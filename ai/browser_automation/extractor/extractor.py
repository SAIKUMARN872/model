"""
Unified web-page extractor.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .content import (
    ContentExtractor,
)
from .metadata import (
    MetadataExtractor,
)
from .utils import (
    character_count,
    clean_text,
    word_count,
)


@dataclass
class ExtractedPage:
    """Complete extracted page."""

    url: str

    title: str

    content: str

    headings: list[str] = field(
        default_factory=list
    )

    paragraphs: list[str] = field(
        default_factory=list
    )

    links: list[dict[str, str]] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    word_count: int = 0

    character_count: int = 0

    success: bool = True

    error: str | None = None

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "url": self.url,
            "title": self.title,
            "content": self.content,
            "headings": self.headings,
            "paragraphs": self.paragraphs,
            "links": self.links,
            "metadata": self.metadata,
            "word_count": self.word_count,
            "character_count": (
                self.character_count
            ),
            "success": self.success,
            "error": self.error,
        }


class PageExtractor:
    """
    Unified extractor for browser pages.

    Combines:

        ContentExtractor
        MetadataExtractor
    """

    def __init__(
        self,
        page: Any,
    ) -> None:

        self.page = page

        self.content = (
            ContentExtractor(page)
        )

        self.metadata = (
            MetadataExtractor(page)
        )

    async def extract(
        self,
        include_links: bool = True,
        include_metadata: bool = True,
    ) -> ExtractedPage:

        url = getattr(
            self.page,
            "url",
            "",
        )

        try:

            title = await self.content.title()

            main_content = (
                await self.content.main_content()
            )

            headings = (
                await self.content.headings()
            )

            paragraphs = (
                await self.content.paragraphs()
            )

            links = (
                await self.content.links()
                if include_links
                else []
            )

            metadata = (
                await self.metadata.extract()
                if include_metadata
                else {}
            )

            return ExtractedPage(
                url=url,
                title=title,
                content=main_content,
                headings=headings,
                paragraphs=paragraphs,
                links=links,
                metadata=metadata,
                word_count=word_count(
                    main_content
                ),
                character_count=character_count(
                    main_content
                ),
                success=True,
            )

        except Exception as exc:

            return ExtractedPage(
                url=url,
                title="",
                content="",
                success=False,
                error=str(exc),
            )

    async def extract_text(
        self,
    ) -> str:

        return await self.content.main_content()

    async def extract_title(
        self,
    ) -> str:

        return await self.content.title()

    async def extract_metadata(
        self,
    ) -> dict[str, Any]:

        return await self.metadata.extract()

    async def extract_links(
        self,
    ) -> list[dict[str, str]]:

        return await self.content.links()

    async def extract_headings(
        self,
    ) -> list[str]:

        return await self.content.headings()