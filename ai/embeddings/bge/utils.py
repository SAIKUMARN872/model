"""
Utility functions for the BGE embedding provider.
"""

from __future__ import annotations

import math
import re
from typing import Any, Iterable


def estimate_tokens(
    text: str,
) -> int:
    """
    Lightweight token estimation.

    For exact token counts, use the tokenizer associated
    with the selected BGE model.
    """

    if not text:
        return 0

    return max(
        1,
        len(
            re.findall(
                r"\S+",
                text,
            )
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
    """
    L2-normalize an embedding vector.
    """

    values = [
        float(value)
        for value in vector
    ]

    if not values:

        raise ValueError(
            "Cannot normalize an empty vector"
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
        normalize_vector(
            embedding
        )
        for embedding in embeddings
    ]


def validate_text(
    text: Any,
) -> str:

    if not isinstance(
        text,
        str,
    ):

        raise TypeError(
            "BGE input must be a string"
        )

    if not text.strip():

        raise ValueError(
            "BGE input cannot be empty"
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


def validate_embeddings(
    embeddings: Any,
    expected_count: int,
) -> list[list[float]]:
    """
    Validate embedding model output.
    """

    if embeddings is None:

        raise ValueError(
            "Embedding model returned None"
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
            "Invalid embedding output"
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

    dimensions = len(
        result[0]
    )

    if dimensions == 0:

        raise ValueError(
            "Embedding vector cannot be empty"
        )

    for embedding in result:

        if len(embedding) != dimensions:

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

    return len(
        embeddings[0]
    )


def build_query_text(
    text: str,
) -> str:
    """
    Prepare text for BGE retrieval.

    BGE retrieval models commonly benefit from a query
    instruction when encoding queries.
    """

    return (
        "Represent this sentence for searching "
        "relevant passages: "
        f"{text}"
    )


def prepare_documents(
    texts: Iterable[str],
) -> list[str]:

    return [
        validate_text(text)
        for text in texts
    ]