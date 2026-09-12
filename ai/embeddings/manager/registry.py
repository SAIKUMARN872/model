"""
Utilities for the embedding provider manager.
"""

from __future__ import annotations

from typing import Any


def normalize_provider_name(
    name: str,
) -> str:

    if not isinstance(
        name,
        str,
    ):
        raise TypeError(
            "Provider name must be a string"
        )

    name = name.strip().lower()

    if not name:
        raise ValueError(
            "Provider name cannot be empty"
        )

    return name.replace(
        " ",
        "_",
    )


def validate_provider(
    provider: Any,
) -> None:

    if provider is None:
        raise ValueError(
            "Provider cannot be None"
        )

    if not any(
        hasattr(provider, attribute)
        for attribute in (
            "embed",
            "embed_many",
            "embed_documents",
        )
    ) and not callable(provider):

        raise TypeError(
            "Invalid embedding provider"
        )


def get_provider_dimension(
    provider: Any,
) -> int:

    if hasattr(
        provider,
        "dimension",
    ):

        return int(
            provider.dimension()
        )

    vector = get_embedding(
        provider,
        "dimension test",
    )

    return len(vector)


def get_embedding(
    provider: Any,
    text: str,
) -> list[float]:

    if hasattr(
        provider,
        "embed",
    ):

        result = provider.embed(
            text
        )

    elif callable(provider):

        result = provider(
            [text]
        )

        if (
            isinstance(result, list)
            and result
            and isinstance(result[0], list)
        ):
            result = result[0]

    else:

        raise TypeError(
            "Provider does not support embedding"
        )

    return [
        float(value)
        for value in result
    ]


def get_embeddings(
    provider: Any,
    texts: list[str],
) -> list[list[float]]:

    if hasattr(
        provider,
        "embed_many",
    ):

        result = provider.embed_many(
            texts
        )

    elif hasattr(
        provider,
        "embed_documents",
    ):

        result = provider.embed_documents(
            texts
        )

    elif callable(provider):

        result = provider(
            texts
        )

    else:

        raise TypeError(
            "Provider does not support batch embedding"
        )

    return [
        [
            float(value)
            for value in vector
        ]
        for vector in result
    ]