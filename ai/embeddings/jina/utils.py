"""Input formatting and validation for Jina embeddings."""

from collections.abc import Sequence
import math
from typing import Any


def validate_text(text: str, name: str = "text") -> str:
    if not isinstance(text, str):
        raise TypeError(f"{name} must be a string")
    if not text.strip():
        raise ValueError(f"{name} must not be empty")
    return text.strip()


def validate_texts(texts: Sequence[str]) -> list[str]:
    if isinstance(texts, (str, bytes)) or not isinstance(texts, Sequence):
        raise TypeError("texts must be a sequence of strings")
    result = [validate_text(text, f"texts[{index}]") for index, text in enumerate(texts)]
    return result


def validate_batch_size(batch_size: int, maximum: int = 512) -> int:
    if isinstance(batch_size, bool) or not isinstance(batch_size, int):
        raise TypeError("batch_size must be an integer")
    if not 1 <= batch_size <= maximum:
        raise ValueError(f"batch_size must be between 1 and {maximum}")
    return batch_size


def prepare_query(text: str) -> str:
    """Validate a query without adding a prefix the model may add internally."""
    return validate_text(text, "query")


def prepare_queries(texts: Sequence[str]) -> list[str]:
    return [prepare_query(text) for text in validate_texts(texts)]


def prepare_document(text: str) -> str:
    """Validate a document without adding a potentially duplicate prefix."""
    return validate_text(text, "document")


def prepare_documents(texts: Sequence[str]) -> list[str]:
    return [prepare_document(text) for text in validate_texts(texts)]


def validate_vector(vector: Any, expected_dimension: int | None = None) -> list[float]:
    try:
        result = [float(value) for value in vector]
    except (TypeError, ValueError) as exc:
        raise ValueError("Embedding must be a one-dimensional numeric vector") from exc

    if not result:
        raise ValueError("Embedding vector must not be empty")
    if expected_dimension is not None and len(result) != expected_dimension:
        raise ValueError(
            f"Expected dimension {expected_dimension}, received {len(result)}"
        )
    if not all(math.isfinite(value) for value in result):
        raise ValueError("Embedding contains non-finite values")
    return result
