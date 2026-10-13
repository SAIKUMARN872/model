"""Text normalization helpers for browser extraction."""

import re


def normalize_text(text: str, *, max_chars: int = 100_000) -> str:
    if not isinstance(text, str):
        raise TypeError("text must be a string.")

    if isinstance(max_chars, bool) or not isinstance(max_chars, int) or max_chars < 0:
        raise ValueError("max_chars must be a non-negative integer.")

    normalized = re.sub(r"[ \t]+", " ", text)
    normalized = re.sub(r"\n\s*\n+", "\n\n", normalized)
    normalized = normalized.strip()

    return normalized[:max_chars]
