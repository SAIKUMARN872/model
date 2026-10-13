"""Shared validation utilities for ModelNow vector-store management."""

from __future__ import annotations

import re


SUPPORTED_BACKENDS = frozenset({"chroma", "faiss"})


def validate_backend_name(name: str) -> str:
    if not isinstance(name, str) or not name.strip():
        raise ValueError("Backend name must be a non-empty string")

    normalized = name.strip().lower()
    if normalized not in SUPPORTED_BACKENDS:
        raise ValueError(
            f"Unsupported backend {normalized!r}; "
            f"supported backends: {', '.join(sorted(SUPPORTED_BACKENDS))}"
        )
    return normalized


def validate_store_name(name: str) -> str:
    if not isinstance(name, str):
        raise TypeError("Store name must be a string")

    name = name.strip()
    if not name or len(name) > 128:
        raise ValueError("Store name must contain 1–128 characters")

    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", name):
        raise ValueError("Store name contains unsupported characters")

    return name
