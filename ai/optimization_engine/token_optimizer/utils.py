from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Optional


def to_decimal(value: object, default: Decimal = Decimal("0")) -> Decimal:
    if value is None:
        return default

    if isinstance(value, Decimal):
        return value

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return default


def validate_text(text: str) -> str:
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    return text


def normalize_text(text: str) -> str:
    text = validate_text(text)
    return " ".join(text.split())


def count_words(text: str) -> int:
    text = normalize_text(text)

    if not text:
        return 0

    return len(text.split())


def count_characters(text: str) -> int:
    return len(validate_text(text))


def calculate_reduction(original: int, optimized: int) -> int:
    if original < 0 or optimized < 0:
        raise ValueError("token counts must be non-negative")

    return max(original - optimized, 0)


def calculate_reduction_ratio(original: int, optimized: int) -> Decimal:
    if original < 0 or optimized < 0:
        raise ValueError("token counts must be non-negative")

    if original == 0:
        return Decimal("0")

    reduction = calculate_reduction(original, optimized)

    return Decimal(reduction) / Decimal(original)


def calculate_reduction_percent(original: int, optimized: int) -> Decimal:
    return calculate_reduction_ratio(original, optimized) * Decimal("100")


def calculate_token_cost(
    input_tokens: int,
    output_tokens: int,
    input_cost_per_token: object,
    output_cost_per_token: object,
) -> Decimal:
    if input_tokens < 0 or output_tokens < 0:
        raise ValueError("token counts must be non-negative")

    input_cost = (
        Decimal(input_tokens)
        * to_decimal(input_cost_per_token)
    )

    output_cost = (
        Decimal(output_tokens)
        * to_decimal(output_cost_per_token)
    )

    return input_cost + output_cost


def estimate_tokens_from_characters(
    characters: int,
    characters_per_token: int = 4,
) -> int:
    if characters < 0:
        raise ValueError("characters must be non-negative")

    if characters_per_token <= 0:
        raise ValueError("characters_per_token must be greater than zero")

    if characters == 0:
        return 0

    return (characters + characters_per_token - 1) // characters_per_token


def clamp_ratio(value: object) -> Decimal:
    ratio = to_decimal(value)

    if ratio < Decimal("0"):
        return Decimal("0")

    if ratio > Decimal("1"):
        return Decimal("1")

    return ratio


def clamp_percent(value: object) -> Decimal:
    percent = to_decimal(value)

    if percent < Decimal("0"):
        return Decimal("0")

    if percent > Decimal("100"):
        return Decimal("100")

    return percent


__all__ = [
    "to_decimal",
    "validate_text",
    "normalize_text",
    "count_words",
    "count_characters",
    "calculate_reduction",
    "calculate_reduction_ratio",
    "calculate_reduction_percent",
    "calculate_token_cost",
    "estimate_tokens_from_characters",
    "clamp_ratio",
    "clamp_percent",
]
