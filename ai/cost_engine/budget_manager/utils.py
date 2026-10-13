from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Optional


def to_decimal(value: Decimal | int | float | str) -> Decimal:
    """Convert a numeric value to Decimal safely."""

    try:
        result = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError(
            f"Invalid decimal value: {value!r}"
        ) from exc

    if not result.is_finite():
        raise ValueError(
            "Decimal value must be finite"
        )

    return result


def validate_budget_limit(
    limit: Decimal | int | float | str,
) -> Decimal:
    """Validate and normalize a budget limit."""

    value = to_decimal(limit)

    if value <= Decimal("0"):
        raise ValueError(
            "Budget limit must be greater than zero"
        )

    return value


def validate_spend_amount(
    amount: Decimal | int | float | str,
) -> Decimal:
    """Validate a spending amount."""

    value = to_decimal(amount)

    if value <= Decimal("0"):
        raise ValueError(
            "Spend amount must be greater than zero"
        )

    return value


def calculate_remaining(
    limit: Decimal | int | float | str,
    spent: Decimal | int | float | str,
) -> Decimal:
    """Calculate remaining budget."""

    normalized_limit = to_decimal(limit)
    normalized_spent = to_decimal(spent)

    if normalized_limit < Decimal("0"):
        raise ValueError(
            "Budget limit cannot be negative"
        )

    if normalized_spent < Decimal("0"):
        raise ValueError(
            "Spent amount cannot be negative"
        )

    return max(
        normalized_limit - normalized_spent,
        Decimal("0"),
    )


def calculate_utilization(
    limit: Decimal | int | float | str,
    spent: Decimal | int | float | str,
) -> Decimal:
    """Calculate budget utilization as a Decimal ratio."""

    normalized_limit = to_decimal(limit)
    normalized_spent = to_decimal(spent)

    if normalized_limit <= Decimal("0"):
        return Decimal("0")

    if normalized_spent < Decimal("0"):
        raise ValueError(
            "Spent amount cannot be negative"
        )

    return normalized_spent / normalized_limit


def is_budget_exceeded(
    limit: Decimal | int | float | str,
    spent: Decimal | int | float | str,
) -> bool:
    """Return whether spending has exceeded the budget."""

    normalized_limit = to_decimal(limit)
    normalized_spent = to_decimal(spent)

    return normalized_spent > normalized_limit


def normalize_period(
    period: Optional[str],
) -> str:
    """Normalize a budget period."""

    if period is None:
        return "monthly"

    normalized = period.strip().lower()

    allowed_periods = {
        "hourly",
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "yearly",
    }

    if normalized not in allowed_periods:
        raise ValueError(
            f"Unsupported budget period: {period}"
        )

    return normalized


__all__ = [
    "to_decimal",
    "validate_budget_limit",
    "validate_spend_amount",
    "calculate_remaining",
    "calculate_utilization",
    "is_budget_exceeded",
    "normalize_period",
]
