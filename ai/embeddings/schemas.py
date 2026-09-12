"""
Validation schemas for embeddings.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable


@dataclass
class EmbeddingRequest:
    """
    Request for embedding generation.
    """

    texts: list[str]

    provider: str | None = None

    model: str | None = None

    input_type: str | None = None

    metadata: dict[str, Any] | None = None


@dataclass
class EmbeddingResponse:
    """
    Standardized embedding response.
    """

    embeddings: list[list[float]]

    provider: str

    model: str

    dimensions: int

    count: int

    usage_tokens: int = 0

    metadata: dict[str, Any] | None = None


@dataclass
class SimilarityRequest:
    """
    Similarity calculation request.
    """

    vector_a: list[float]

    vector_b: list[float]

    metric: str = "cosine"


@dataclass
class SimilarityResponse:
    """
    Similarity calculation response.
    """

    score: float

    metric: str

    distance: float | None = None


def validate_embedding_request(
    request: EmbeddingRequest,
) -> EmbeddingRequest:

    if not request.texts:

        raise ValueError(
            "Embedding request must contain text"
        )

    validated = []

    for text in request.texts:

        if not isinstance(
            text,
            str,
        ):

            raise TypeError(
                "Every embedding input must be a string"
            )

        text = text.strip()

        if not text:

            raise ValueError(
                "Embedding input cannot be empty"
            )

        validated.append(text)

    request.texts = validated

    if request.input_type:

        if request.input_type not in (
            "query",
            "document",
        ):

            raise ValueError(
                "input_type must be "
                "'query' or 'document'"
            )

    return request


def validate_vector(
    vector: Iterable[float],
) -> list[float]:

    if vector is None:

        raise ValueError(
            "Vector cannot be None"
        )

    try:

        values = [
            float(value)
            for value in vector
        ]

    except (
        TypeError,
        ValueError,
    ) as exc:

        raise ValueError(
            "Invalid vector"
        ) from exc

    if not values:

        raise ValueError(
            "Vector cannot be empty"
        )

    return values