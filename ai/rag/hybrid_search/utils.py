from __future__ import annotations

import math
import re
from collections.abc import Mapping
from typing import Any


def tokenize(text: str) -> list[str]:
    """Convert text into lowercase searchable tokens."""
    if not isinstance(text, str):
        raise TypeError("text must be a string.")

    return re.findall(r"[\w-]+", text.casefold())


def validate_query(query: str) -> str:
    """Validate and normalize a search query."""
    if not isinstance(query, str):
        raise TypeError("query must be a string.")

    query = query.strip()
    if not query:
        raise ValueError("query cannot be empty.")

    if not tokenize(query):
        raise ValueError("query must contain searchable tokens.")

    return query


def validate_top_k(top_k: int) -> int:
    """Require a positive integer, excluding booleans."""
    if isinstance(top_k, bool) or not isinstance(top_k, int):
        raise TypeError("top_k must be an integer.")

    if top_k < 1:
        raise ValueError("top_k must be at least 1.")

    return top_k


def validate_filters(
    filters: Mapping[str, Any] | None,
) -> dict[str, Any]:
    """Validate metadata filters and return a separate dictionary."""
    if filters is None:
        return {}

    if not isinstance(filters, Mapping):
        raise TypeError("filters must be a mapping or None.")

    result: dict[str, Any] = {}

    for key, value in filters.items():
        if not isinstance(key, str) or not key.strip():
            raise ValueError("Filter keys must be non-empty strings.")

        result[key] = value

    return result


def validate_finite_number(value: float, name: str = "value") -> float:
    """Validate that a numeric value is finite."""
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise TypeError(f"{name} must be a number.")

    number = float(value)

    if not math.isfinite(number):
        raise ValueError(f"{name} must be finite.")

    return number


__all__ = [
    "tokenize",
    "validate_query",
    "validate_top_k",
    "validate_filters",
    "validate_finite_number",
]
