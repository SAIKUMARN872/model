from __future__ import annotations

from decimal import Decimal, InvalidOperation


def to_decimal(value: Decimal | int | float | str) -> Decimal:
    """Convert a numeric value to Decimal safely."""
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError(f"Invalid decimal value: {value}") from exc


def validate_cost(value: Decimal | int | float | str) -> Decimal:
    """Validate a non-negative cost."""
    amount = to_decimal(value)

    if amount < Decimal("0"):
        raise ValueError("Cost must not be negative")

    return amount


def calculate_savings(
    baseline_cost: Decimal | int | float | str,
    optimized_cost: Decimal | int | float | str,
) -> Decimal:
    """Calculate absolute savings."""
    baseline = validate_cost(baseline_cost)
    optimized = validate_cost(optimized_cost)

    return max(
        baseline - optimized,
        Decimal("0"),
    )


def calculate_savings_percentage(
    baseline_cost: Decimal | int | float | str,
    optimized_cost: Decimal | int | float | str,
) -> Decimal:
    """Calculate savings percentage relative to baseline."""
    baseline = validate_cost(baseline_cost)
    optimized = validate_cost(optimized_cost)

    if baseline == Decimal("0"):
        return Decimal("0")

    savings = calculate_savings(baseline, optimized)

    return (savings / baseline) * Decimal("100")


def calculate_reduction_ratio(
    baseline_cost: Decimal | int | float | str,
    optimized_cost: Decimal | int | float | str,
) -> Decimal:
    """Calculate the optimized-to-baseline cost ratio."""
    baseline = validate_cost(baseline_cost)
    optimized = validate_cost(optimized_cost)

    if baseline == Decimal("0"):
        return Decimal("0")

    return optimized / baseline


def round_savings(
    value: Decimal | int | float | str,
    places: int = 8,
) -> Decimal:
    """Round a savings value to a fixed number of decimal places."""
    if places < 0:
        raise ValueError("places must not be negative")

    amount = to_decimal(value)
    quantum = Decimal("1").scaleb(-places)

    return amount.quantize(quantum)


__all__ = [
    "to_decimal",
    "validate_cost",
    "calculate_savings",
    "calculate_savings_percentage",
    "calculate_reduction_ratio",
    "round_savings",
]
