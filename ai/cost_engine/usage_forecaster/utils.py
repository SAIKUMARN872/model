from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import List

from .models import UsagePoint


def to_decimal(value: Decimal | int | float | str) -> Decimal:
    """Convert a value to Decimal."""
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError(f"Invalid decimal value: {value}") from exc


def validate_tokens(tokens: int) -> int:
    """Validate a token count."""
    if not isinstance(tokens, int):
        raise ValueError("tokens must be an integer")

    if tokens < 0:
        raise ValueError("tokens must not be negative")

    return tokens


def validate_requests(requests: int) -> int:
    """Validate a request count."""
    if not isinstance(requests, int):
        raise ValueError("requests must be an integer")

    if requests < 0:
        raise ValueError("requests must not be negative")

    return requests


def validate_cost(
    cost: Decimal | int | float | str,
) -> Decimal:
    """Validate a non-negative usage cost."""
    value = to_decimal(cost)

    if value < Decimal("0"):
        raise ValueError("cost must not be negative")

    return value


def total_tokens(history: List[UsagePoint]) -> int:
    """Calculate total historical tokens."""
    return sum(
        validate_tokens(point.tokens)
        for point in history
    )


def total_requests(history: List[UsagePoint]) -> int:
    """Calculate total historical requests."""
    return sum(
        validate_requests(point.requests)
        for point in history
    )


def total_cost(history: List[UsagePoint]) -> Decimal:
    """Calculate total historical cost."""
    return sum(
        (
            validate_cost(point.cost)
            for point in history
        ),
        Decimal("0"),
    )


def average_tokens(history: List[UsagePoint]) -> Decimal:
    """Calculate average tokens per period."""
    if not history:
        return Decimal("0")

    return Decimal(total_tokens(history)) / Decimal(len(history))


def average_requests(history: List[UsagePoint]) -> Decimal:
    """Calculate average requests per period."""
    if not history:
        return Decimal("0")

    return Decimal(total_requests(history)) / Decimal(len(history))


def average_cost(history: List[UsagePoint]) -> Decimal:
    """Calculate average cost per period."""
    if not history:
        return Decimal("0")

    return total_cost(history) / Decimal(len(history))


def calculate_growth_rate(
    previous: Decimal | int | float | str,
    current: Decimal | int | float | str,
) -> Decimal:
    """Calculate percentage growth from previous to current."""
    previous_value = to_decimal(previous)
    current_value = to_decimal(current)

    if previous_value < Decimal("0"):
        raise ValueError("previous value must not be negative")

    if current_value < Decimal("0"):
        raise ValueError("current value must not be negative")

    if previous_value == Decimal("0"):
        return Decimal("0")

    return (
        (current_value - previous_value)
        / previous_value
    ) * Decimal("100")


def calculate_confidence(history_count: int) -> Decimal:
    """Estimate forecast confidence from historical sample size."""
    if history_count < 0:
        raise ValueError("history_count must not be negative")

    if history_count == 0:
        return Decimal("0")

    if history_count == 1:
        return Decimal("25")

    if history_count == 2:
        return Decimal("40")

    if history_count == 3:
        return Decimal("55")

    if history_count == 4:
        return Decimal("70")

    if history_count == 5:
        return Decimal("80")

    return min(
        Decimal("95"),
        Decimal("80") + Decimal(history_count - 5),
    )


__all__ = [
    "to_decimal",
    "validate_tokens",
    "validate_requests",
    "validate_cost",
    "total_tokens",
    "total_requests",
    "total_cost",
    "average_tokens",
    "average_requests",
    "average_cost",
    "calculate_growth_rate",
    "calculate_confidence",
]
