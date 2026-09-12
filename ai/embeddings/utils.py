"""
General embedding utilities.
"""

from __future__ import annotations

import math
import re
from typing import Iterable


def validate_text(
    text: str,
) -> str:

    if not isinstance(
        text,
        str,
    ):

        raise TypeError(
            "Text must be a string"
        )

    text = text.strip()

    if not text:

        raise ValueError(
            "Text cannot be empty"
        )

    return text


def validate_texts(
    texts: Iterable[str],
) -> list[str]:

    result = [
        validate_text(text)
        for text in texts
    ]

    if not result:

        raise ValueError(
            "At least one text is required"
        )

    return result


def normalize_vector(
    vector: Iterable[float],
) -> list[float]:

    values = [
        float(value)
        for value in vector
    ]

    if not values:

        raise ValueError(
            "Vector cannot be empty"
        )

    norm = math.sqrt(
        sum(
            value * value
            for value in values
        )
    )

    if norm == 0:

        return values

    return [
        value / norm
        for value in values
    ]


def normalize_embeddings(
    embeddings: Iterable[
        Iterable[float]
    ],
) -> list[list[float]]:

    return [
        normalize_vector(
            embedding
        )
        for embedding in embeddings
    ]


def validate_dimensions(
    embeddings: list[list[float]],
) -> int:

    if not embeddings:

        raise ValueError(
            "Embedding list cannot be empty"
        )

    dimensions = len(
        embeddings[0]
    )

    if dimensions == 0:

        raise ValueError(
            "Embedding vectors cannot be empty"
        )

    for vector in embeddings:

        if len(vector) != dimensions:

            raise ValueError(
                "All embeddings must have "
                "the same dimensions"
            )

    return dimensions


def estimate_tokens(
    text: str,
) -> int:

    text = validate_text(
        text
    )

    words = re.findall(
        r"\S+",
        text,
    )

    return max(
        1,
        int(
            len(words) * 1.3
        ),
    )


def estimate_tokens_batch(
    texts: Iterable[str],
) -> int:

    return sum(
        estimate_tokens(text)
        for text in texts
    )


def chunk_text(
    text: str,
    max_characters: int,
    overlap: int = 0,
) -> list[str]:

    text = validate_text(
        text
    )

    if max_characters <= 0:

        raise ValueError(
            "max_characters must be positive"
        )

    if overlap < 0:

        raise ValueError(
            "overlap cannot be negative"
        )

    if overlap >= max_characters:

        raise ValueError(
            "overlap must be smaller than "
            "max_characters"
        )

    if len(text) <= max_characters:

        return [text]

    chunks = []

    start = 0

    step = (
        max_characters - overlap
    )

    while start < len(text):

        end = min(
            start + max_characters,
            len(text),
        )

        chunk = text[
            start:end
        ].strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break

        start += step

    return chunks


def cosine_similarity(
    vector_a: Iterable[float],
    vector_b: Iterable[float],
) -> float:

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
            "Vector dimensions do not match"
        )

    if not a:

        raise ValueError(
            "Vectors cannot be empty"
        )

    dot = sum(
        x * y
        for x, y in zip(a, b)
    )

    norm_a = math.sqrt(
        sum(x * x for x in a)
    )

    norm_b = math.sqrt(
        sum(y * y for y in b)
    )

    if norm_a == 0 or norm_b == 0:

        return 0.0

    return dot / (
        norm_a * norm_b
    )


def batch_items(
    items: list,
    batch_size: int,
) -> list[list]:

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