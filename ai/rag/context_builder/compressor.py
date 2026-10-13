from __future__ import annotations


def truncate_text(text: str, max_chars: int) -> str:
    """Truncate text to a maximum length, preferring a word boundary."""
    if not isinstance(text, str):
        raise TypeError("text must be a string.")
    if isinstance(max_chars, bool) or not isinstance(max_chars, int):
        raise TypeError("max_chars must be an integer.")
    if max_chars < 0:
        raise ValueError("max_chars cannot be negative.")

    if len(text) <= max_chars:
        return text
    if max_chars == 0:
        return ""

    candidate = text[:max_chars]
    boundary = candidate.rfind(" ")

    if boundary >= max_chars // 2:
        candidate = candidate[:boundary]

    return candidate.rstrip()


__all__ = ["truncate_text"]
