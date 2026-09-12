"""
Utility functions for embedding text normalization.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Any, Iterable


def validate_text(text: Any) -> str:
    """Validate that the input is a usable string."""

    if not isinstance(text, str):
        raise TypeError(
            "Text must be a string"
        )

    text = text.strip()

    if not text:
        raise ValueError(
            "Text cannot be empty"
        )

    return text


def validate_texts(
    texts: Iterable[Any],
) -> list[str]:
    """Validate multiple text inputs."""

    result = [
        validate_text(text)
        for text in texts
    ]

    if not result:
        raise ValueError(
            "At least one text is required"
        )

    return result


def unicode_normalize(
    text: str,
    form: str = "NFKC",
) -> str:
    """Normalize Unicode characters."""

    text = validate_text(text)

    return unicodedata.normalize(
        form,
        text,
    )


def normalize_line_endings(
    text: str,
) -> str:
    """Normalize CRLF/CR line endings."""

    return (
        text.replace("\r\n", "\n")
        .replace("\r", "\n")
    )


def collapse_spaces(
    text: str,
) -> str:
    """Collapse repeated spaces and tabs."""

    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    return text


def collapse_newlines(
    text: str,
) -> str:
    """Collapse excessive blank lines."""

    return re.sub(
        r"\n{3,}",
        "\n\n",
        text,
    )


def remove_control_characters(
    text: str,
) -> str:
    """Remove unwanted Unicode control characters."""

    result = []

    for char in text:

        category = unicodedata.category(
            char
        )

        if category == "Cc" and char not in (
            "\n",
            "\t",
        ):
            continue

        result.append(char)

    return "".join(result)


def strip_html(
    text: str,
) -> str:
    """Remove basic HTML tags."""

    return re.sub(
        r"<[^>]+>",
        " ",
        text,
    )


def normalize_whitespace(
    text: str,
) -> str:
    """Normalize all common whitespace."""

    text = normalize_line_endings(
        text
    )

    text = collapse_spaces(
        text
    )

    text = collapse_newlines(
        text
    )

    return text.strip()


def normalize_for_embedding(
    text: str,
) -> str:
    """
    Apply safe normalization suitable for
    embedding generation.
    """

    text = validate_text(
        text
    )

    text = unicode_normalize(
        text
    )

    text = remove_control_characters(
        text
    )

    text = normalize_whitespace(
        text
    )

    if not text:
        raise ValueError(
            "Text became empty after normalization"
        )

    return text


def normalize_many(
    texts: Iterable[str],
) -> list[str]:

    return [
        normalize_for_embedding(text)
        for text in texts
    ]


def truncate_text(
    text: str,
    max_characters: int,
) -> str:

    if max_characters <= 0:
        raise ValueError(
            "max_characters must be positive"
        )

    text = normalize_for_embedding(
        text
    )

    if len(text) <= max_characters:
        return text

    return text[
        :max_characters
    ].rstrip()


def text_statistics(
    text: str,
) -> dict[str, int]:

    text = validate_text(
        text
    )

    words = re.findall(
        r"\S+",
        text,
    )

    lines = text.count(
        "\n"
    ) + 1

    return {
        "characters": len(text),
        "words": len(words),
        "lines": lines,
    }