from __future__ import annotations


def safe_average(
    total: float,
    count: int,
) -> float:
    """Calculate an average without division by zero."""

    if count <= 0:
        return 0.0

    return total / count


def percentage(
    value: int,
    total: int,
) -> float:
    """Calculate a percentage safely."""

    if total <= 0:
        return 0.0

    return (
        value / total
    ) * 100.0


__all__ = [
    "percentage",
    "safe_average",
]
