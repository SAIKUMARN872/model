"""Shared utilities for ModelNow ingestion."""

from __future__ import annotations

import hashlib
import re
from pathlib import Path


SUPPORTED_EXTENSIONS = frozenset({".txt", ".md", ".markdown", ".json", ".csv"})


def normalize_text(text: str) -> str:
    if not isinstance(text, str):
        raise TypeError("text must be a string")
    text = text.replace("\x00", "")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = "\n".join(line.rstrip() for line in text.split("\n"))
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def validate_source_id(source_id: str) -> str:
    if not isinstance(source_id, str) or not source_id.strip():
        raise ValueError("source_id must be a non-empty string")
    return source_id.strip()


def source_id_for_path(path: str | Path) -> str:
    resolved = str(Path(path).expanduser().resolve())
    return hashlib.sha256(resolved.encode("utf-8")).hexdigest()


def validate_extension(path: str | Path) -> str:
    extension = Path(path).suffix.lower()
    if extension not in SUPPORTED_EXTENSIONS:
        supported = ", ".join(sorted(SUPPORTED_EXTENSIONS))
        raise ValueError(
            f"Unsupported file extension {extension!r}. Supported: {supported}"
        )
    return extension


def validate_chunk_settings(chunk_size: int, overlap: int) -> None:
    if isinstance(chunk_size, bool) or not isinstance(chunk_size, int):
        raise TypeError("chunk_size must be an integer")
    if isinstance(overlap, bool) or not isinstance(overlap, int):
        raise TypeError("overlap must be an integer")
    if chunk_size < 1:
        raise ValueError("chunk_size must be positive")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and < chunk_size")
