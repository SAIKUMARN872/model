from __future__ import annotations

import re


def normalize_text(text: str) -> str:
    """Normalize whitespace without changing textual meaning."""
    return " ".join(str(text).split())


def estimate_tokens(
    text: str,
) -> int:
    """Estimate token count without requiring a tokenizer.

    A conservative approximation of four characters per token
    is used for latency-planning purposes.
    """

    normalized = normalize_text(text)

    if not normalized:
        return 0

    return max(
        1,
        (len(normalized) + 3) // 4,
    )


def estimate_message_tokens(
    messages: list[dict[str, object]],
) -> int:
    """Estimate total tokens across message content."""

    total = 0

    for message in messages:
        content = message.get("content", "")

        if isinstance(content, str):
            total += estimate_tokens(content)

    return total


def compression_ratio(
    original_length: int,
    compressed_length: int,
) -> float:
    """Calculate compressed/original size ratio."""

    if original_length < 0:
        raise ValueError(
            "original_length cannot be negative"
        )

    if compressed_length < 0:
        raise ValueError(
            "compressed_length cannot be negative"
        )

    if original_length == 0:
        return 1.0

    return compressed_length / original_length


def reduction_percent(
    original_length: int,
    compressed_length: int,
) -> float:
    """Calculate percentage reduction."""

    if original_length < 0:
        raise ValueError(
            "original_length cannot be negative"
        )

    if compressed_length < 0:
        raise ValueError(
            "compressed_length cannot be negative"
        )

    if original_length == 0:
        return 0.0

    return (
        (original_length - compressed_length)
        / original_length
        * 100.0
    )


def truncate_to_char_limit(
    text: str,
    max_characters: int,
) -> str:
    """Safely truncate text to a character limit."""

    if max_characters < 0:
        raise ValueError(
            "max_characters cannot be negative"
        )

    return str(text)[:max_characters]


def remove_repeated_spaces(
    text: str,
) -> str:
    """Collapse repeated spaces and tabs."""

    return re.sub(
        r"[ \t]+",
        " ",
        str(text),
    ).strip()


__all__ = [
    "normalize_text",
    "estimate_tokens",
    "estimate_message_tokens",
    "compression_ratio",
    "reduction_percent",
    "truncate_to_char_limit",
    "remove_repeated_spaces",
]
