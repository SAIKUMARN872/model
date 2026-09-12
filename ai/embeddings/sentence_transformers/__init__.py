"""
Utilities for Sentence Transformers embeddings.
"""

from __future__ import annotations

import math
import re
from typing import Any, Iterable


def validate_text(
    text: Any,
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

    return max(
        1,
        int(
            len(
                re.findall(
                    r"\S+",
                    text,
                )
            )
            * 1.3
        ),
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
            "Vector dimensions must match"
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


def get_dimensions(
    embeddings: list[list[float]],
) -> int:

    if not embeddings:
        return 0

    return len(
        embeddings[0]
    )