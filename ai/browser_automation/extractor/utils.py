"""
Utilities for web content extraction.
"""

from __future__ import annotations

import re
from urllib.parse import (
    urljoin,
)


def clean_text(
    text: str,
) -> str:
    """Normalize extracted text."""

    if not text:
        return ""

    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    text = re.sub(
        r"\n\s*\n+",
        "\n\n",
        text,
    )

    return text.strip()


def normalize_whitespace(
    text: str,
) -> str:

    return re.sub(
        r"\s+",
        " ",
        text or "",
    ).strip()


def absolute_url(
    url: str,
    base_url: str,
) -> str:

    return urljoin(
        base_url,
        url,
    )


def extract_words(
    text: str,
) -> list[str]:

    return re.findall(
        r"\b[\w'-]+\b",
        text or "",
        flags=re.UNICODE,
    )


def word_count(
    text: str,
) -> int:

    return len(
        extract_words(text)
    )


def character_count(
    text: str,
) -> int:

    return len(
        text or ""
    )


def truncate(
    text: str,
    max_length: int,
) -> str:

    if max_length <= 0:

        raise ValueError(
            "max_length must be positive."
        )

    text = text or ""

    if len(text) <= max_length:
        return text

    return (
        text[:max_length - 3]
        + "..."
    )


def unique_preserve_order(
    values: list[str],
) -> list[str]:

    seen = set()

    result = []

    for value in values:

        if value not in seen:

            seen.add(value)

            result.append(value)

    return result