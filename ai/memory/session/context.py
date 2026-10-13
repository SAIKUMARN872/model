from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .utils import (
    MAX_CONTEXT_ITEMS,
    validate_context_item,
    validate_identifier,
)


class SessionContext:
    """Utilities for safely updating session-scoped context."""

    @staticmethod
    def merge(
        existing: Mapping[str, Any],
        updates: Mapping[str, Any],
    ) -> dict[str, Any]:
        if not isinstance(existing, Mapping) or not isinstance(updates, Mapping):
            raise ValueError("existing context and updates must be mappings")

        result = validate_context_item(dict(existing))
        clean_updates = validate_context_item(dict(updates))
        result.update(clean_updates)

        if len(result) > MAX_CONTEXT_ITEMS:
            raise ValueError("session context exceeds the maximum item count")

        return validate_context_item(result)

    @staticmethod
    def get(context: Mapping[str, Any], key: str, default: Any = None) -> Any:
        if not isinstance(context, Mapping):
            raise ValueError("context must be a mapping")
        key = validate_identifier(key, "context key")
        return validate_context_item(context[key]) if key in context else default

    @staticmethod
    def remove(context: Mapping[str, Any], key: str) -> dict[str, Any]:
        if not isinstance(context, Mapping):
            raise ValueError("context must be a mapping")
        key = validate_identifier(key, "context key")
        result = validate_context_item(dict(context))
        result.pop(key, None)
        return result
