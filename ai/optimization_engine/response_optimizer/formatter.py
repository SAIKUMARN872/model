"""Response formatting utilities for ModelNow optimization."""

from __future__ import annotations

import json
import re
from typing import Any, Mapping


def normalize_text(value: Any) -> str:
    """Convert a response value into normalized text."""
    if value is None:
        return ""

    text = str(value).replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)

    lines = [line.strip() for line in text.split("\n")]

    while lines and not lines[0]:
        lines.pop(0)

    while lines and not lines[-1]:
        lines.pop()

    return "\n".join(lines)


def format_plain_text(value: Any) -> str:
    """Format a response as clean plain text."""
    return normalize_text(value)


def format_markdown(value: Any) -> str:
    """Format response content as normalized Markdown."""
    text = normalize_text(value)

    lines = text.split("\n")
    formatted: list[str] = []

    for line in lines:
        stripped = line.strip()

        if not stripped:
            if formatted and formatted[-1] != "":
                formatted.append("")
            continue

        formatted.append(stripped)

    return "\n".join(formatted).strip()


def format_json(
    value: Any,
    *,
    indent: int | None = 2,
) -> str:
    """Serialize a response value as JSON."""
    try:
        return json.dumps(
            value,
            indent=indent,
            ensure_ascii=False,
            default=str,
        )
    except (TypeError, ValueError) as exc:
        raise ValueError("value cannot be serialized as JSON") from exc


def format_structured(
    value: Mapping[str, Any],
    *,
    indent: int | None = 2,
) -> str:
    """Format a structured mapping as JSON."""
    if not isinstance(value, Mapping):
        raise TypeError("value must be a mapping")

    return format_json(dict(value), indent=indent)


def truncate_text(
    value: Any,
    max_chars: int,
    *,
    suffix: str = "...",
) -> str:
    """Truncate text to a maximum character count."""
    if not isinstance(max_chars, int) or max_chars < 0:
        raise ValueError("max_chars must be a non-negative integer")

    text = normalize_text(value)

    if len(text) <= max_chars:
        return text

    if max_chars == 0:
        return ""

    if len(suffix) >= max_chars:
        return suffix[:max_chars]

    return text[: max_chars - len(suffix)].rstrip() + suffix


def compact_whitespace(value: Any) -> str:
    """Collapse all whitespace into single spaces."""
    return " ".join(normalize_text(value).split())


__all__ = [
    "compact_whitespace",
    "format_json",
    "format_markdown",
    "format_plain_text",
    "format_structured",
    "normalize_text",
    "truncate_text",
]
