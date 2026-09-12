"""
Utility functions for the ModelNow indexing package.
"""

from __future__ import annotations

import hashlib
import math
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Iterable


def utc_now() -> datetime:
    """Return the current UTC timestamp."""

    return datetime.now(timezone.utc)


def generate_id(
    prefix: str = "idx",
) -> str:
    """Generate a unique identifier."""

    return f"{prefix}_{uuid.uuid4().hex}"


def normalize_text(
    text: str,
) -> str:
    """Normalize text before indexing."""

    if not isinstance(text, str):

        raise TypeError(
            "Text must be a string"
        )

    text = text.replace(
        "\r\n",
        "\n",
    ).replace(
        "\r",
        "\n",
    )

    # Normalize excessive whitespace while preserving
    # paragraph boundaries.
    paragraphs = []

    for paragraph in text.split("\n"):

        paragraph = re.sub(
            r"[ \t]+",
            " ",
            paragraph,
        ).strip()

        if paragraph:

            paragraphs.append(
                paragraph
            )

    return "\n\n".join(
        paragraphs
    )


def tokenize(
    text: str,
) -> list[str]:
    """Lightweight tokenization."""

    return re.findall(
        r"\b\w+\b",
        text.lower(),
    )


def estimate_tokens(
    text: str,
) -> int:
    """Estimate the number of tokens."""

    if not text:
        return 0

    return max(
        1,
        int(
            len(tokenize(text))
            * 1.3
        ),
    )


def estimate_characters(
    text: str,
) -> int:

    return len(text)


def content_hash(
    text: str,
) -> str:
    """Create a deterministic content hash."""

    normalized = normalize_text(
        text
    )

    return hashlib.sha256(
        normalized.encode(
            "utf-8"
        )
    ).hexdigest()


def document_hash(
    document_id: str,
    text: str,
) -> str:
    """Create a deterministic document/version hash."""

    payload = (
        f"{document_id}:{content_hash(text)}"
    )

    return hashlib.sha256(
        payload.encode(
            "utf-8"
        )
    ).hexdigest()


def cosine_similarity(
    vector_a: Iterable[float],
    vector_b: Iterable[float],
) -> float:
    """Calculate cosine similarity."""

    a = [
        float(x)
        for x in vector_a
    ]

    b = [
        float(x)
        for x in vector_b
    ]

    if len(a) != len(b):

        raise ValueError(
            "Vectors must have the same dimensions"
        )

    if not a:

        return 0.0

    dot = sum(
        x * y
        for x, y in zip(a, b)
    )

    norm_a = math.sqrt(
        sum(
            x * x
            for x in a
        )
    )

    norm_b = math.sqrt(
        sum(
            y * y
            for y in b
        )
    )

    if norm_a == 0 or norm_b == 0:

        return 0.0

    return dot / (
        norm_a * norm_b
    )


def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> list[str]:
    """
    Split text into overlapping word chunks.

    Args:
        text: Input document.
        chunk_size: Maximum words per chunk.
        overlap: Words shared between adjacent chunks.
    """

    if chunk_size <= 0:

        raise ValueError(
            "chunk_size must be positive"
        )

    if overlap < 0:

        raise ValueError(
            "overlap cannot be negative"
        )

    if overlap >= chunk_size:

        raise ValueError(
            "overlap must be smaller than chunk_size"
        )

    words = text.split()

    if not words:

        return []

    chunks = []

    step = (
        chunk_size - overlap
    )

    for start in range(
        0,
        len(words),
        step,
    ):

        chunk = " ".join(
            words[
                start:start + chunk_size
            ]
        )

        if chunk:

            chunks.append(
                chunk
            )

        if (
            start + chunk_size
            >= len(words)
        ):

            break

    return chunks


def batch_items(
    items: list[Any],
    batch_size: int,
) -> list[list[Any]]:
    """Split items into batches."""

    if batch_size <= 0:

        raise ValueError(
            "batch_size must be positive"
        )

    return [
        items[index:index + batch_size]
        for index in range(
            0,
            len(items),
            batch_size,
        )
    ]


def merge_metadata(
    *metadata: dict[str, Any] | None,
) -> dict[str, Any]:
    """Merge metadata dictionaries."""

    result: dict[str, Any] = {}

    for item in metadata:

        if item:

            result.update(
                item
            )

    return result


def validate_dimension(
    vector: Iterable[float],
    expected_dimension: int | None = None,
) -> list[float]:
    """Validate an embedding vector."""

    result = [
        float(value)
        for value in vector
    ]

    if not result:

        raise ValueError(
            "Embedding vector cannot be empty"
        )

    if (
        expected_dimension is not None
        and len(result)
        != expected_dimension
    ):

        raise ValueError(
            "Embedding dimension mismatch: "
            f"expected {expected_dimension}, "
            f"received {len(result)}"
        )

    return result