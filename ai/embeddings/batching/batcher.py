"""
Embedding request batching.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Iterable

from .utils import (
    estimate_batch_tokens,
    normalize_texts,
)


@dataclass
class BatchConfig:
    """Configuration for embedding batches."""

    max_batch_size: int = 32

    max_tokens: int = 8192

    normalize: bool = True

    def __post_init__(self) -> None:

        if self.max_batch_size <= 0:
            raise ValueError(
                "max_batch_size must be positive."
            )

        if self.max_tokens <= 0:
            raise ValueError(
                "max_tokens must be positive."
            )


@dataclass
class Batch:
    """A batch of texts."""

    texts: list[str]

    metadata: list[dict[str, Any]] = field(
        default_factory=list
    )

    estimated_tokens: int = 0

    def __post_init__(self) -> None:

        if not self.metadata:
            self.metadata = [
                {}
                for _ in self.texts
            ]

        if len(self.metadata) != len(
            self.texts
        ):
            raise ValueError(
                "metadata length must match texts."
            )

        if self.estimated_tokens == 0:
            self.estimated_tokens = (
                estimate_batch_tokens(
                    self.texts
                )
            )


class EmbeddingBatcher:
    """
    Creates batches while respecting both
    request count and estimated token limits.
    """

    def __init__(
        self,
        config: BatchConfig | None = None,
    ) -> None:

        self.config = (
            config
            or BatchConfig()
        )

    def create_batches(
        self,
        texts: Iterable[str],
        metadata: Iterable[
            dict[str, Any]
        ] | None = None,
    ) -> list[Batch]:

        normalized = list(texts)

        if self.config.normalize:
            normalized = normalize_texts(
                normalized
            )

        metadata_list = (
            list(metadata)
            if metadata is not None
            else [
                {}
                for _ in normalized
            ]
        )

        if len(metadata_list) != len(
            normalized
        ):
            raise ValueError(
                "metadata length must match texts."
            )

        batches: list[Batch] = []

        current_texts: list[str] = []
        current_metadata: list[
            dict[str, Any]
        ] = []

        current_tokens = 0

        for text, item_metadata in zip(
            normalized,
            metadata_list,
        ):

            tokens = (
                estimate_batch_tokens(
                    [text]
                )
            )

            should_flush = (
                current_texts
                and (
                    len(current_texts)
                    >= self.config.max_batch_size
                    or (
                        current_tokens
                        + tokens
                        > self.config.max_tokens
                    )
                )
            )

            if should_flush:

                batches.append(
                    Batch(
                        texts=current_texts,
                        metadata=current_metadata,
                        estimated_tokens=current_tokens,
                    )
                )

                current_texts = []
                current_metadata = []
                current_tokens = 0

            current_texts.append(text)
            current_metadata.append(
                item_metadata
            )
            current_tokens += tokens

        if current_texts:

            batches.append(
                Batch(
                    texts=current_texts,
                    metadata=current_metadata,
                    estimated_tokens=current_tokens,
                )
            )

        return batches