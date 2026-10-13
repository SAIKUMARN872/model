"""Unified browser content and metadata extraction."""

from typing import Any

from .content import extract_content
from .metadata import extract_metadata
from .utils import normalize_text


class PageExtractor:
    def __init__(
        self,
        *,
        max_chars: int = 100_000,
        max_links: int = 100,
    ) -> None:
        if isinstance(max_chars, bool) or not isinstance(max_chars, int) or max_chars < 0:
            raise ValueError("max_chars must be a non-negative integer.")

        if isinstance(max_links, bool) or not isinstance(max_links, int) or max_links < 0:
            raise ValueError("max_links must be a non-negative integer.")

        self.max_chars = max_chars
        self.max_links = max_links

    async def extract(self, page: Any) -> dict:
        content = await extract_content(page, max_links=self.max_links)
        metadata = await extract_metadata(page)

        return {
            "metadata": metadata,
            "content": {
                "text": normalize_text(
                    content["text"],
                    max_chars=self.max_chars,
                ),
                "links": content["links"],
            },
            "truncated": len(normalize_text(content["text"], max_chars=10**18))
            > self.max_chars,
        }
