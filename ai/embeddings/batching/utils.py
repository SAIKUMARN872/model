"""
Utilities used by the embedding batching system.
"""

from __future__ import annotations

from typing import Iterable, Iterator, TypeVar


T = TypeVar("T")


def chunk_items(
    items: Iterable[T],
    batch_size: int,
) -> Iterator[list[T]]:
    """
    Split an iterable into batches.
    """

    if batch_size <= 0:
        raise ValueError(
            "batch_size must be greater than zero."
        )

    batch: list[T] = []

    for item in items:
        batch.append(item)

        if len(batch) >= batch_size:
            yield batch
            batch = []

    if batch:
        yield batch


def normalize_text(
    text: str,
) -> str:
    """Normalize embedding input text."""

    if text is None:
        raise ValueError(
            "Text cannot be None."
        )

    return " ".join(
        str(text).strip().split()
    )


def normalize_texts(
    texts: Iterable[str],
) -> list[str]:
    """Normalize multiple texts."""

    return [
        normalize_text(text)
        for text in texts
    ]


def estimate_tokens(
    text: str,
) -> int:
    """
    Lightweight token estimation.

    This is intentionally approximate and should not
    replace a model-specific tokenizer.
    """

    text = normalize_text(text)

    if not text:
        return 0

    words = text.split()

    return max(
        len(words),
        int(len(text) / 4),
    )


def estimate_batch_tokens(
    texts: Iterable[str],
) -> int:

    return sum(
        estimate_tokens(text)
        for text in texts
    )