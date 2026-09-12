"""
Utilities for the Jina embedding provider.
"""

from __future__ import annotations

import math
import re
from typing import Any, Iterable


def validate_text(text: Any) -> str:
    if not isinstance(text, str):
        raise TypeError(
            "Jina input must be a string"
        )

    text = text.strip()

    if not text:
        raise ValueError(
            "Jina input cannot be empty"
        )

    return text


def validate_texts(
    texts: Iterable[Any],
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


def estimate_tokens(
    text: str,
) -> int:

    if not text:
        return 0

    words = re.findall(
        r"\S+",
        text,
    )

    return max(
        1,
        int(len(words) * 1.3),
    )


def estimate_tokens_batch(
    texts: Iterable[str],
) -> int:

    return sum(
        estimate_tokens(text)
        for text in texts
    )


def normalize_vector(
    vector: Iterable[float],
) -> list[float]:

    values = [
        float(value)
        for value in vector
    ]

    if not values:
        raise ValueError(
            "Embedding vector cannot be empty"
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
    embeddings: Iterable[Iterable[float]],
) -> list[list[float]]:

    return [
        normalize_vector(embedding)
        for embedding in embeddings
    ]


def validate_embeddings(
    embeddings: Any,
    expected_count: int,
) -> list[list[float]]:

    if embeddings is None:
        raise ValueError(
            "Jina returned no embeddings"
        )

    try:
        result = [
            [
                float(value)
                for value in embedding
            ]
            for embedding in embeddings
        ]

    except (
        TypeError,
        ValueError,
    ) as exc:

        raise ValueError(
            "Invalid Jina embedding output"
        ) from exc

    if len(result) != expected_count:
        raise ValueError(
            "Embedding count mismatch: "
            f"expected {expected_count}, "
            f"received {len(result)}"
        )

    if not result:
        raise ValueError(
            "Embedding result cannot be empty"
        )

    dimension = len(result[0])

    if dimension == 0:
        raise ValueError(
            "Embedding vectors cannot be empty"
        )

    for vector in result:
        if len(vector) != dimension:
            raise ValueError(
                "All embeddings must have "
                "the same dimensions"
            )

    return result


def get_dimensions(
    embeddings: list[list[float]],
) -> int:

    if not embeddings:
        return 0

    return len(embeddings[0])


def cosine_similarity(
    vector_a: Iterable[float],
    vector_b: Iterable[float],
) -> float:

    a = list(
        map(float, vector_a)
    )

    b = list(
        map(float, vector_b)
    )

    if len(a) != len(b):
        raise ValueError(
            "Vectors must have equal dimensions"
        )

    if not a:
        return 0.0

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