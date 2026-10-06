from __future__ import annotations

from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

from .constants import (
    COST_PRECISION,
    DEFAULT_CURRENCY,
    MIN_TOKEN_COUNT,
    TOKENS_PER_1K,
)


def to_decimal(value) -> Decimal:
    """Safely convert a numeric value to Decimal."""
    if isinstance(value, Decimal):
        return value

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError(f"Invalid decimal value: {value!r}") from exc


def validate_token_count(value: int, field_name: str = "token_count") -> int:
    """Validate and normalize a token count."""
    if isinstance(value, bool) or not isinstance(value, int):
        raise TypeError(f"{field_name} must be an integer")

    if value < MIN_TOKEN_COUNT:
        raise ValueError(f"{field_name} cannot be negative")

    return value


def calculate_token_cost(
    token_count: int,
    cost_per_1k_tokens: Decimal,
) -> Decimal:
    """Calculate cost for a token count using a per-1K token price."""
    token_count = validate_token_count(token_count)
    price = to_decimal(cost_per_1k_tokens)

    if price < Decimal("0"):
        raise ValueError("cost_per_1k_tokens cannot be negative")

    return (
        Decimal(token_count)
        / Decimal(TOKENS_PER_1K)
        * price
    )


def round_cost(value: Decimal) -> Decimal:
    """Round monetary cost to the engine precision."""
    decimal_value = to_decimal(value)

    quantum = Decimal("1").scaleb(-COST_PRECISION)

    return decimal_value.quantize(
        quantum,
        rounding=ROUND_HALF_UP,
    )


def normalize_currency(currency: str | None) -> str:
    """Normalize a currency code."""
    if not currency:
        return DEFAULT_CURRENCY

    normalized = currency.strip().upper()

    if len(normalized) != 3:
        raise ValueError("currency must be a 3-letter ISO-style code")

    return normalized
