from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP


MONEY_PRECISION = Decimal("0.000001")


def to_decimal(value: Decimal | float | int | str) -> Decimal:
    """Safely convert a value to Decimal."""
    return Decimal(str(value))


def round_cost(
    value: Decimal | float | int | str,
    precision: Decimal = MONEY_PRECISION,
) -> Decimal:
    """Round a monetary value consistently."""
    return to_decimal(value).quantize(
        precision,
        rounding=ROUND_HALF_UP,
    )


def safe_int(value: int | float | str | None) -> int:
    """Convert a value to a non-negative integer."""
    if value is None:
        return 0

    result = int(value)

    if result < 0:
        raise ValueError("Value cannot be negative")

    return result


def percentage(
    value: Decimal | float | int,
    percent: Decimal | float | int,
) -> Decimal:
    """Calculate a percentage of a value."""
    return (
        to_decimal(value)
        * to_decimal(percent)
        / Decimal("100")
    )


def normalize_model_name(model: str) -> str:
    """Normalize model identifiers for cache lookup."""
    if not model:
        raise ValueError("model cannot be empty")

    return model.strip().lower()