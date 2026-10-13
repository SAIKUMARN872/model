"""Shared utility functions for vector collection management."""

from __future__ import annotations

import hashlib
import json
from typing import Any

from ai.vector_store.collections.validator import (
    validate_collection_name,
    validate_metadata,
)


def collection_key(name: str) -> str:
    """Return a stable, filesystem-safe key for a collection name."""
    normalized = validate_collection_name(name)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def merge_metadata(
    existing: dict[str, Any] | None,
    updates: dict[str, Any] | None,
) -> dict[str, Any]:
    """Merge metadata updates into existing metadata."""
    result = validate_metadata(existing)
    result.update(validate_metadata(updates))
    return result


def metadata_to_json(metadata: dict[str, Any] | None) -> str:
    """Serialize metadata deterministically."""
    return json.dumps(
        validate_metadata(metadata),
        ensure_ascii=False,
        sort_keys=True,
        allow_nan=False,
    )


def metadata_from_json(value: str) -> dict[str, Any]:
    """Deserialize and validate metadata."""
    parsed = json.loads(value)
    return validate_metadata(parsed)
