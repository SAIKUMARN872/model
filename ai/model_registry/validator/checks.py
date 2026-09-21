from __future__ import annotations

from math import isfinite
from typing import Any


def is_non_empty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def is_non_negative_number(value: Any) -> bool:
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and isfinite(float(value))
        and value >= 0
    )


def is_positive_integer(value: Any) -> bool:
    return (
        isinstance(value, int)
        and not isinstance(value, bool)
        and value > 0
    )


def is_valid_score(value: Any) -> bool:
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and isfinite(float(value))
        and 0.0 <= float(value) <= 1.0
    )


def are_valid_aliases(value: Any) -> bool:
    if not isinstance(value, tuple):
        return False

    return all(
        isinstance(alias, str) and bool(alias.strip())
        for alias in value
    )


__all__ = [
    "is_non_empty_string",
    "is_non_negative_number",
    "is_positive_integer",
    "is_valid_score",
    "are_valid_aliases",
]
