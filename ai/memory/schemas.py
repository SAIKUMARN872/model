"""Validated constructors for memory API and backend boundaries."""

from __future__ import annotations

from typing import Any, Mapping

from .exceptions import MemoryValidationError
from .models import MemoryQuery, MemoryRecord


def validate_record_payload(payload: Mapping[str, Any]) -> MemoryRecord:
    """Validate an untrusted mapping before it enters a memory subsystem."""
    if not isinstance(payload, Mapping):
        raise MemoryValidationError("record payload must be a mapping")
    return MemoryRecord.from_dict(dict(payload))


def validate_query_payload(payload: Mapping[str, Any]) -> MemoryQuery:
    """Validate a query payload with mandatory tenant scoping."""
    if not isinstance(payload, Mapping):
        raise MemoryValidationError("query payload must be a mapping")

    allowed = {
        "tenant_id", "user_id", "query", "memory_types", "limit",
        "created_after", "created_before", "include_expired", "metadata_filters",
    }
    unknown = set(payload) - allowed
    if unknown:
        raise MemoryValidationError(
            f"Unknown query fields: {', '.join(sorted(map(str, unknown)))}"
        )
    if "tenant_id" not in payload:
        raise MemoryValidationError("tenant_id is required")

    return MemoryQuery(**dict(payload))
