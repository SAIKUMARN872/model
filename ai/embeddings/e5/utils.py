"""
Utility functions for the E5 embedding provider.
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
    with the selected E5 model.
    """

    if not text:
        return 0

    words = re.findall(
        r"\S+",
        text,
    )

    # Rough approximation.
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


def validate_text(
    text: Any,
) -> str:
    """
    Validate one embedding input.
    """

    if not isinstance(
        text,
        str,
    ):
        raise TypeError(
            "E5 input must be a string"
        )

    if not text.strip():
        raise ValueError(
            "E5 input cannot be empty"
        )

    return text.strip()


def validate_texts(
    texts: Iterable[Any],
) -> list[str]:
    """
    Validate a collection of input texts.
    """

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
    """
    L2-normalize an embedding vector.
    """

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
        normalize_vector(
            embedding
        )
        for embedding in embeddings
    ]


def validate_embeddings(
    embeddings: Any,
    expected_count: int,
) -> list[list[float]]:
    """
    Validate model output.
    """

    if embeddings is None:
        raise ValueError(
            "E5 model returned None"
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
            "Invalid E5 embedding output"
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

    dimensions = len(result[0])

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


def prepare_query(
    text: str,
    prefix: str = "query: ",
) -> str:
    """
    Prepare a query using the E5 query prefix.
    """

    text = validate_text(text)

    if text.startswith(prefix):
        return text

    return f"{prefix}{text}"


def prepare_passage(
    text: str,
    prefix: str = "passage: ",
) -> str:
    """
    Prepare a document/passage using the E5 passage prefix.
    """

    text = validate_text(text)

    if text.startswith(prefix):
        return text

    return f"{prefix}{text}"


def prepare_queries(
    texts: Iterable[str],
    prefix: str = "query: ",
) -> list[str]:
    return [
        prepare_query(
            text,
            prefix=prefix,
        )
        for text in texts
    ]


def prepare_passages(
    texts: Iterable[str],
    prefix: str = "passage: ",
) -> list[str]:
    return [
        prepare_passage(
            text,
            prefix=prefix,
        )
        for text in texts
    ]


def cosine_similarity(
    vector_a: Iterable[float],
    vector_b: Iterable[float],
) -> float:
    """
    Calculate cosine similarity between two vectors.
    """

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


def cosine_similarity_matrix(
    query: list[float],
    documents: list[list[float]],
) -> list[float]:
    """
    Calculate similarity between one query and
    multiple document embeddings.
    """

    return [
        cosine_similarity(
            query,
            document,
        )
        for document in documents
    ]