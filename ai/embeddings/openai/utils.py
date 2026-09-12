"""
Utilities for OpenAI embeddings.
"""

from __future__ import annotations

import math
import os
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
            "Embedding input must be a string"
        )

    text = text.strip()

    if not text:
        raise ValueError(
            "Embedding input cannot be empty"
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


def get_api_key(
    api_key: str | None = None,
) -> str:

    key = (
        api_key
        or os.getenv(
            "OPENAI_API_KEY"
        )
    )

    if not key:

        raise ValueError(
            "OpenAI API key is not configured. "
            "Set OPENAI_API_KEY or provide api_key."
        )

    return key


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
            vector
        )
        for vector in embeddings
    ]


def validate_embeddings(
    embeddings: Any,
    expected_count: int,
) -> list[list[float]]:

    if embeddings is None:

        raise ValueError(
            "OpenAI returned no embeddings"
        )

    try:

        result = [
            [
                float(value)
                for value in vector
            ]
            for vector in embeddings
        ]

    except (
        TypeError,
        ValueError,
    ) as exc:

        raise ValueError(
            "Invalid OpenAI embedding response"
        ) from exc

    if len(result) != expected_count:

        raise ValueError(
            "Embedding count mismatch"
        )

    if not result:

        raise ValueError(
            "No embeddings returned"
        )

    dimensions = len(
        result[0]
    )

    for vector in result:

        if len(vector) != dimensions:

            raise ValueError(
                "Embedding dimensions are inconsistent"
            )

    return result


def get_dimensions(
    embeddings: list[list[float]],
) -> int:

    if not embeddings:
        return 0

    return len(
        embeddings[0]
    )


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
            "Vector dimensions do not match"
        )

    dot = sum(
        x * y
        for x, y in zip(
            a,
            b,
        )
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