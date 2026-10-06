from __future__ import annotations

from decimal import Decimal, InvalidOperation


def to_decimal(
    value: Decimal | int | float | str,
) -> Decimal:
    """Convert a value to a finite Decimal."""

    try:
        result = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError(
            f"Invalid decimal value: {value!r}"
        ) from exc

    if not result.is_finite():
        raise ValueError(
            "Value must be finite"
        )

    return result


def validate_token_count(
    token_count: int,
) -> int:
    """Validate a token count."""

    if not isinstance(token_count, int):
        raise TypeError(
            "Token count must be an integer"
        )

    if token_count < 0:
        raise ValueError(
            "Token count cannot be negative"
        )

    return token_count


def calculate_token_cost(
    token_count: int,
    cost_per_1k_tokens: Decimal | int | float | str,
) -> Decimal:
    """Calculate cost for a token count."""

    tokens = validate_token_count(token_count)
    price = to_decimal(cost_per_1k_tokens)

    if price < Decimal("0"):
        raise ValueError(
            "Token price cannot be negative"
        )

    return (
        Decimal(tokens)
        / Decimal("1000")
        * price
    )


def calculate_total_cost(
    input_tokens: int,
    output_tokens: int,
    input_cost_per_1k_tokens: Decimal | int | float | str,
    output_cost_per_1k_tokens: Decimal | int | float | str,
) -> Decimal:
    """Calculate total input and output token cost."""

    input_cost = calculate_token_cost(
        input_tokens,
        input_cost_per_1k_tokens,
    )

    output_cost = calculate_token_cost(
        output_tokens,
        output_cost_per_1k_tokens,
    )

    return input_cost + output_cost


def calculate_confidence(
    minimum_cost: Decimal,
    expected_cost: Decimal,
    maximum_cost: Decimal,
) -> Decimal:
    """Calculate a simple confidence score for a cost range."""

    minimum = to_decimal(minimum_cost)
    expected = to_decimal(expected_cost)
    maximum = to_decimal(maximum_cost)

    if minimum < Decimal("0"):
        raise ValueError(
            "minimum_cost cannot be negative"
        )

    if maximum < minimum:
        raise ValueError(
            "maximum_cost cannot be less than minimum_cost"
        )

    if expected < minimum or expected > maximum:
        raise ValueError(
            "expected_cost must be within the cost range"
        )

    if maximum == minimum:
        return Decimal("1")

    distance = maximum - minimum
    expected_distance = abs(
        expected - minimum
    )

    confidence = (
        Decimal("1")
        - (expected_distance / distance)
    )

    return max(
        Decimal("0"),
        min(Decimal("1"), confidence),
    )


__all__ = [
    "to_decimal",
    "validate_token_count",
    "calculate_token_cost",
    "calculate_total_cost",
    "calculate_confidence",
]
