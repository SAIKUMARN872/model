from __future__ import annotations

from decimal import Decimal


def to_decimal(value: Decimal | int | float | str) -> Decimal:
    """Convert a numeric value to a finite Decimal."""

    try:
        result = Decimal(str(value))
    except (ValueError, TypeError) as exc:
        raise ValueError(
            f"Invalid decimal value: {value!r}"
        ) from exc

    if not result.is_finite():
        raise ValueError(
            "Value must be finite"
        )

    return result


def calculate_projected_spend(
    spent: Decimal | int | float | str,
    requested_cost: Decimal | int | float | str,
) -> Decimal:
    """Calculate spending after the requested operation."""

    normalized_spent = to_decimal(spent)
    normalized_cost = to_decimal(requested_cost)

    if normalized_spent < Decimal("0"):
        raise ValueError(
            "Spent amount cannot be negative"
        )

    if normalized_cost < Decimal("0"):
        raise ValueError(
            "Requested cost cannot be negative"
        )

    return normalized_spent + normalized_cost


def calculate_remaining(
    limit: Decimal | int | float | str,
    projected_spend: Decimal | int | float | str,
) -> Decimal:
    """Calculate remaining budget after projected spending."""

    normalized_limit = to_decimal(limit)
    normalized_spend = to_decimal(projected_spend)

    if normalized_limit <= Decimal("0"):
        raise ValueError(
            "Budget limit must be greater than zero"
        )

    return max(
        normalized_limit - normalized_spend,
        Decimal("0"),
    )


def calculate_utilization(
    limit: Decimal | int | float | str,
    projected_spend: Decimal | int | float | str,
) -> Decimal:
    """Calculate projected budget utilization."""

    normalized_limit = to_decimal(limit)
    normalized_spend = to_decimal(projected_spend)

    if normalized_limit <= Decimal("0"):
        raise ValueError(
            "Budget limit must be greater than zero"
        )

    return normalized_spend / normalized_limit


def would_exceed_budget(
    limit: Decimal | int | float | str,
    spent: Decimal | int | float | str,
    requested_cost: Decimal | int | float | str,
) -> bool:
    """Return whether a request would exceed the budget."""

    projected_spend = calculate_projected_spend(
        spent,
        requested_cost,
    )

    normalized_limit = to_decimal(limit)

    if normalized_limit <= Decimal("0"):
        raise ValueError(
            "Budget limit must be greater than zero"
        )

    return projected_spend > normalized_limit


__all__ = [
    "to_decimal",
    "calculate_projected_spend",
    "calculate_remaining",
    "calculate_utilization",
    "would_exceed_budget",
]
