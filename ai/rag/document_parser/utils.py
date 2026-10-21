from __future__ import annotations

import re
import unicodedata


def normalize_text(text: str) -> str:
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = "".join(
        char for char in text
        if char in "\n\t" or unicodedata.category(char) != "Cc"
    )
    text = unicodedata.normalize("NFC", text)
    text = re.sub(r"[ \t\f\v]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def require_text(text: str, *, allow_empty: bool = False) -> str:
    if not isinstance(text, str):
        raise TypeError("Input must be a string")
    normalized = normalize_text(text)
    if not allow_empty and not normalized:
        raise ValueError("Input contains no readable text")
    return normalized
