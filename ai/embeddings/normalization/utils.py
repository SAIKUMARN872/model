from __future__ import annotations

from collections.abc import Sequence

from .cleaner import clean_text, clean_texts
from .normalizer import normalize_vector, normalize_vectors


def validate_text(text: str, *, allow_empty: bool = False) -> str:
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    if not allow_empty and not text.strip():
        raise ValueError("text must not be empty")

    return text


def validate_text_batch(
    texts: Sequence[str],
    *,
    allow_empty_batch: bool = True,
    allow_empty_text: bool = False,
) -> list[str]:
    if isinstance(texts, (str, bytes)) or not isinstance(texts, Sequence):
        raise TypeError("texts must be a sequence of strings")

    values = list(texts)

    if not values and not allow_empty_batch:
        raise ValueError("text batch must not be empty")

    return [
        validate_text(text, allow_empty=allow_empty_text)
        for text in values
    ]


def validate_vector_dimensions(
    vectors: Sequence[Sequence[float]],
) -> int:
    if isinstance(vectors, (str, bytes)) or not isinstance(vectors, Sequence):
        raise TypeError("vectors must be a sequence")

    if not vectors:
        return 0

    first = vectors[0]

    if isinstance(first, (str, bytes)) or not isinstance(first, Sequence):
        raise TypeError("each vector must be a sequence")

    dimension = len(first)

    if dimension == 0:
        raise ValueError("vectors must not be empty")

    for index, vector in enumerate(vectors):
        if isinstance(vector, (str, bytes)) or not isinstance(vector, Sequence):
            raise TypeError(f"vectors[{index}] must be a sequence")

        if len(vector) != dimension:
            raise ValueError("all vectors must have the same dimension")

    return dimension


def preprocess_for_embedding(
    texts: list[str] | tuple[str, ...],
    *,
    lowercase: bool = False,
) -> list[str]:
    values = validate_text_batch(texts)
    cleaned = clean_texts(values)

    if lowercase:
        cleaned = [text.lower() for text in cleaned]

    for index, text in enumerate(cleaned):
        if not text:
            raise ValueError(f"processed text at index {index} is empty")

    return cleaned


__all__ = [
    "clean_text",
    "clean_texts",
    "normalize_vector",
    "normalize_vectors",
    "validate_text",
    "validate_text_batch",
    "validate_vector_dimensions",
    "preprocess_for_embedding",
]
