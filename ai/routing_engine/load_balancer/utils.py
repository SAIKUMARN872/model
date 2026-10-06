"""Utilities for routing load-balancing decisions."""

from __future__ import annotations

from typing import Iterable, TypeVar

T = TypeVar("T")


def safe_weight(value: float, default: float = 1.0) -> float:
    """Return a positive finite weight or the supplied default."""
    if value != value or value <= 0:
        return default
    return value


def weighted_total(values: Iterable[float]) -> float:
    """Calculate the total of positive routing weights."""
    return sum(safe_weight(value, 0.0) for value in values)
