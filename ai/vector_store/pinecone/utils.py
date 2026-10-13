import math
import re
from typing import Any


_INDEX_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]*$")


def validate_index_name(name: str) -> str:
    if not isinstance(name, str) or not _INDEX_PATTERN.fullmatch(name):
        raise ValueError("Index name must contain lowercase letters, numbers, and hyphens.")
    if len(name) > 45:
        raise ValueError("Index name cannot exceed 45 characters.")
    return name


def validate_dimension(dimension: int) -> int:
    if isinstance(dimension, bool) or not isinstance(dimension, int):
        raise ValueError("Dimension must be an integer.")
    if not 1 <= dimension <= 20000:
        raise ValueError("Dimension must be between 1 and 20000.")
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
        value = float(value)
        if not math.isfinite(value):
            raise ValueError("Vector values must be finite.")
        result.append(value)

    if dimension is not None and len(result) != validate_dimension(dimension):
        raise ValueError(f"Expected a vector with {dimension} dimensions.")
    return result


def validate_metadata(metadata: Any) -> dict:
    if metadata is None:
        return {}
    if not isinstance(metadata, dict):
        raise ValueError("Metadata must be a dictionary.")

    def check(value, path="metadata"):
        if value is None:
            raise ValueError(f"{path} cannot contain null values.")
        if isinstance(value, bool):
            return
        if isinstance(value, (str, int, float)):
            if isinstance(value, float) and not math.isfinite(value):
                raise ValueError(f"{path} must contain finite numbers.")
            return
        if isinstance(value, list):
            for index, item in enumerate(value):
                if not isinstance(item, (str, int, float, bool)):
                    raise ValueError(f"{path}[{index}] must be a scalar value.")
                check(item, f"{path}[{index}]")
            return
        raise ValueError(f"{path} contains an unsupported value.")

    for key, value in metadata.items():
        if not isinstance(key, str) or not key:
            raise ValueError("Metadata keys must be non-empty strings.")
        check(value, f"metadata.{key}")
    return metadata


def validate_vector_id(vector_id: str) -> str:
    if not isinstance(vector_id, str) or not vector_id.strip():
        raise ValueError("Vector ID must be a non-empty string.")
    if len(vector_id) > 512:
        raise ValueError("Vector ID cannot exceed 512 characters.")
    return vector_id
