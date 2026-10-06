from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Iterable


def to_decimal(value: object, default: Decimal = Decimal("0")) -> Decimal:
    """Convert a value to Decimal safely."""
    if isinstance(value, Decimal):
        return value

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return default


def validate_context(context: str) -> str:
    """Validate that context is a string."""
    if not isinstance(context, str):
        raise TypeError("context must be a string")
    return context


def normalize_context(context: str) -> str:
    """Normalize line endings and trailing whitespace."""
    context = validate_context(context)
    context = context.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.rstrip() for line in context.split("\n")]
    return "\n".join(lines).strip()


def split_context(context: str) -> list[str]:
    """Split context into non-empty lines."""
    normalized = normalize_context(context)
    if not normalized:
        return []
    return [line.strip() for line in normalized.split("\n") if line.strip()]


def count_context_units(context: str) -> int:
    """Count non-empty context lines."""
    return len(split_context(context))


def count_characters(context: str) -> int:
    """Count characters in context."""
    return len(validate_context(context))


def count_words(context: str) -> int:
    """Count whitespace-separated words."""
    return len(validate_context(context).split())


def calculate_reduction(original: int, optimized: int) -> int:
    """Calculate absolute reduction."""
    return max(0, original - optimized)


def calculate_reduction_ratio(original: int, optimized: int) -> Decimal:
    """Calculate reduction ratio between 0 and 1."""
    if original <= 0:
        return Decimal("0")

    reduction = calculate_reduction(original, optimized)
    ratio = Decimal(reduction) / Decimal(original)

    if ratio < 0:
        return Decimal("0")
    if ratio > 1:
        return Decimal("1")

    return ratio


def calculate_reduction_percent(original: int, optimized: int) -> Decimal:
    """Calculate reduction percentage."""
    return calculate_reduction_ratio(original, optimized) * Decimal("100")


def estimate_tokens(context: str, characters_per_token: float = 4.0) -> int:
    """Estimate token count from character length."""
    validate_context(context)

    if characters_per_token <= 0:
        raise ValueError("characters_per_token must be greater than zero")

    if not context:
        return 0

    return max(1, round(len(context) / characters_per_token))


def deduplicate_lines(lines: Iterable[str]) -> list[str]:
    """Remove duplicate lines while preserving original order."""
    seen: set[str] = set()
    result: list[str] = []

    for line in lines:
        normalized = line.strip()

        if not normalized:
            continue

        if normalized in seen:
            continue

        seen.add(normalized)
        result.append(normalized)

    return result


def calculate_context_ratio(original: int, optimized: int) -> Decimal:
    """Calculate optimized/original size ratio."""
    if original <= 0:
        return Decimal("1")

    ratio = Decimal(optimized) / Decimal(original)

    if ratio < 0:
        return Decimal("0")
    if ratio > 1:
        return Decimal("1")

    return ratio
