from __future__ import annotations

import re
import unicodedata


WHITESPACE_RE = re.compile(r"\s+")
CONTROL_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def clean_text(
    text: str,
    *,
    unicode_normalization: str = "NFC",
    strip_control_characters: bool = True,
    collapse_whitespace: bool = True,
    strip_edges: bool = True,
) -> str:
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    if unicode_normalization not in ("NFC", "NFD", "NFKC", "NFKD", "none"):
        raise ValueError("unsupported Unicode normalization form")

    result = text

    if unicode_normalization != "none":
        result = unicodedata.normalize(unicode_normalization, result)

    if strip_control_characters:
        result = CONTROL_RE.sub("", result)

    if collapse_whitespace:
        result = WHITESPACE_RE.sub(" ", result)

    if strip_edges:
        result = result.strip()

    return result


def clean_texts(texts: list[str] | tuple[str, ...]) -> list[str]:
    if isinstance(texts, (str, bytes)) or not isinstance(texts, (list, tuple)):
        raise TypeError("texts must be a list or tuple of strings")

    return [clean_text(text) for text in texts]
