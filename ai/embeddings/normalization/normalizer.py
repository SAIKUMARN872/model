"""
Main embedding text normalizer.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .cleaner import (
    CleanerConfig,
    TextCleaner,
)
from .utils import (
    normalize_for_embedding,
    normalize_many,
    truncate_text,
)


@dataclass
class NormalizerConfig:
    """Configuration for the embedding normalizer."""

    cleaner: CleanerConfig = field(
        default_factory=CleanerConfig
    )

    max_characters: int | None = None

    add_query_prefix: str = ""

    add_document_prefix: str = ""

    preserve_case: bool = True


class TextNormalizer:
    """
    Central text normalization component.

    It provides separate handling for queries
    and documents.
    """

    def __init__(
        self,
        config: NormalizerConfig | None = None,
    ) -> None:

        self.config = (
            config
            or NormalizerConfig()
        )

        self.cleaner = TextCleaner(
            self.config.cleaner
        )

    def normalize(
        self,
        text: str,
    ) -> str:

        text = self.cleaner.clean(
            text
        )

        if (
            self.config.max_characters
            is not None
        ):

            text = truncate_text(
                text,
                self.config.max_characters,
            )

        if not self.config.preserve_case:

            text = text.lower()

        return normalize_for_embedding(
            text
        )

    def normalize_many(
        self,
        texts: list[str],
    ) -> list[str]:

        return [
            self.normalize(text)
            for text in texts
        ]

    def normalize_query(
        self,
        query: str,
    ) -> str:

        query = self.normalize(
            query
        )

        prefix = (
            self.config.add_query_prefix
        )

        if prefix and not query.startswith(
            prefix
        ):

            query = prefix + query

        return query

    def normalize_queries(
        self,
        queries: list[str],
    ) -> list[str]:

        return [
            self.normalize_query(
                query
            )
            for query in queries
        ]

    def normalize_document(
        self,
        document: str,
    ) -> str:

        document = self.normalize(
            document
        )

        prefix = (
            self.config.add_document_prefix
        )

        if (
            prefix
            and not document.startswith(
                prefix
            )
        ):

            document = prefix + document

        return document

    def normalize_documents(
        self,
        documents: list[str],
    ) -> list[str]:

        return [
            self.normalize_document(
                document
            )
            for document in documents
        ]

    def compare(
        self,
        original: str,
    ) -> dict[str, Any]:

        normalized = self.normalize(
            original
        )

        return {
            "original": original,
            "normalized": normalized,
            "changed": (
                original != normalized
            ),
            "original_length": len(
                original
            ),
            "normalized_length": len(
                normalized
            ),
        }