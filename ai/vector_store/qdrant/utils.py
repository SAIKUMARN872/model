import math
import re
from typing import Any


_COLLECTION_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")


def validate_collection_name(name: str) -> str:
    if not isinstance(name, str) or not name:
        raise ValueError("Collection name must be a non-empty string.")
    if len(name) > 255 or not _COLLECTION_PATTERN.fullmatch(name):
        raise ValueError("Collection name contains invalid characters or is too long.")
    return name


def validate_dimension(dimension: int) -> int:
    if isinstance(dimension, bool) or not isinstance(dimension, int):
        raise ValueError("Dimension must be an integer.")
    if not 1 <= dimension <= 65536:
        raise ValueError("Dimension must be between 1 and 65536.")
    return dimension


def validate_top_k(top_k: int) -> int:
    if isinstance(top_k, bool) or not isinstance(top_k, int):
        raise ValueError("top_k must be an integer.")
    if not 1 <= top_k <= 1000:
        raise ValueError("top_k must be between 1 and 1000.")
    return top_k


def validate_vector(vector: Any, dimension: int | None = None) -> list[float]:
    if isinstance(vector, (str, bytes)) or not isinstance(vector, (list, tuple)):
        raise ValueError("Vector must be a list or tuple of numbers.")
    if not vector:
        raise ValueError("Vector cannot be empty.")

    result = []
    for value in vector:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError("Vector values must be numeric.")
        number = float(value)
        if not math.isfinite(number):
            raise ValueError("Vector values must be finite.")
        result.append(number)

    if dimension is not None and len(result) != validate_dimension(dimension):
        raise ValueError(f"Expected a vector with {dimension} dimensions.")
    return result


def validate_metadata(metadata: Any) -> dict:
    if metadata is None:
        return {}
    if not isinstance(metadata, dict):
        raise ValueError("Metadata must be a dictionary.")
    return metadata


def validate_document_id(document_id: str) -> str:
    if not isinstance(document_id, str) or not document_id.strip():
        raise ValueError("Document ID must be a non-empty string.")
    if len(document_id) > 512:
        raise ValueError("Document ID cannot exceed 512 characters.")
    return document_id
