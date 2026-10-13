from __future__ import annotations

from collections.abc import Mapping
from typing import Any


def merge_metadata(
    base: Mapping[str, Any] | None = None,
    extra: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    result = dict(base or {})
    result.update(extra or {})
    return result


def validate_document_id(document_id: str) -> str:
    if not isinstance(document_id, str) or not document_id.strip():
        raise ValueError("Document ID must be a non-empty string.")
    return document_id.strip()


__all__ = ["merge_metadata", "validate_document_id"]
