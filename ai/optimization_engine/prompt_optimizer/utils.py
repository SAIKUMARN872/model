from __future__ import annotations

import re
from decimal import Decimal, InvalidOperation


def to_decimal(
    value: object,
    default: Decimal = Decimal("0"),
) -> Decimal:
    if isinstance(value, Decimal):
        return value

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return default


def validate_prompt(prompt: str) -> str:
    if not isinstance(prompt, str):
        raise TypeError("prompt must be a string")

    return prompt


def normalize_prompt(prompt: str) -> str:
    prompt = validate_prompt(prompt)

    prompt = prompt.replace("\r\n", "\n")
    prompt = prompt.replace("\r", "\n")

    lines = [line.rstrip() for line in prompt.split("\n")]

    return "\n".join(lines).strip()


def split_prompt_lines(prompt: str) -> list[str]:
    normalized = normalize_prompt(prompt)

    if not normalized:
        return []

    return [
        line.strip()
        for line in normalized.split("\n")
        if line.strip()
    ]


def count_characters(prompt: str) -> int:
    return len(validate_prompt(prompt))


def count_words(prompt: str) -> int:
    return len(validate_prompt(prompt).split())


def count_lines(prompt: str) -> int:
    return len(split_prompt_lines(prompt))


def estimate_tokens(
    prompt: str,
    characters_per_token: float = 4.0,
) -> int:
    validate_prompt(prompt)

    if characters_per_token <= 0:
        raise ValueError(
            "characters_per_token must be greater than zero"
        )

    if not prompt:
        return 0

    return max(
        1,
        round(len(prompt) / characters_per_token),
    )


def calculate_reduction(
    original: int,
    optimized: int,
) -> int:
    return max(0, original - optimized)


def calculate_reduction_ratio(
    original: int,
    optimized: int,
) -> Decimal:
    if original <= 0:
        return Decimal("0")

    reduction = calculate_reduction(
        original,
        optimized,
    )

    ratio = Decimal(reduction) / Decimal(original)

    if ratio < 0:
        return Decimal("0")

    if ratio > 1:
        return Decimal("1")

    return ratio


def calculate_reduction_percent(
    original: int,
    optimized: int,
) -> Decimal:
    return (
        calculate_reduction_ratio(
            original,
            optimized,
        )
        * Decimal("100")
    )


def normalize_whitespace(prompt: str) -> str:
    prompt = validate_prompt(prompt)

    return re.sub(
        r"[ \t]+",
        " ",
        prompt,
    )


def remove_repeated_blank_lines(prompt: str) -> str:
    prompt = validate_prompt(prompt)

    return re.sub(
        r"\n{3,}",
        "\n\n",
        prompt,
    )


def remove_repeated_spaces(prompt: str) -> str:
    prompt = validate_prompt(prompt)

    return re.sub(
        r"[ \t]{2,}",
        " ",
        prompt,
    )


def calculate_prompt_ratio(
    original: int,
    optimized: int,
) -> Decimal:
    if original <= 0:
        return Decimal("1")

    ratio = Decimal(optimized) / Decimal(original)

    if ratio < 0:
        return Decimal("0")

    if ratio > 1:
        return Decimal("1")

    return ratio


__all__ = [
    "calculate_prompt_ratio",
    "calculate_reduction",
    "calculate_reduction_percent",
    "calculate_reduction_ratio",
    "count_characters",
    "count_lines",
    "count_words",
    "estimate_tokens",
    "normalize_prompt",
    "normalize_whitespace",
    "remove_repeated_blank_lines",
    "remove_repeated_spaces",
    "split_prompt_lines",
    "to_decimal",
    "validate_prompt",
]
