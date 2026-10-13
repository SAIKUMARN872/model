"""Utility helpers for ModelNow policy optimization."""

from __future__ import annotations

import hashlib
import json
from decimal import Decimal, InvalidOperation
from typing import Any, Mapping


def normalize_action(action: str) -> str:
    """Normalize a policy action."""
    if not isinstance(action, str) or not action.strip():
        raise ValueError("action must be a non-empty string")
    return action.strip().lower()


def normalize_field(field: str) -> str:
    """Normalize a policy context field name."""
    if not isinstance(field, str) or not field.strip():
        raise ValueError("field must be a non-empty string")
    return field.strip()


def to_decimal(value: Any, field_name: str = "value") -> Decimal:
    """Convert a numeric value to a finite Decimal."""
    try:
        result = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError(f"{field_name} must be numeric") from exc

    if not result.is_finite():
        raise ValueError(f"{field_name} must be finite")

    return result


def context_value(
    context: Mapping[str, Any],
    field: str,
    default: Any = None,
) -> Any:
    """Safely retrieve a value from a policy context."""
    if not isinstance(context, Mapping):
        raise TypeError("context must be a mapping")
    return context.get(field, default)


def make_policy_id(
    name: str,
    field: str,
    action: str = "allow",
) -> str:
    """Create a deterministic policy identifier."""
    payload = {
        "name": str(name).strip(),
        "field": str(field).strip(),
        "action": normalize_action(action),
    }
    encoded = json.dumps(
        payload,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=True,
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()[:16]


def freeze_context(context: Mapping[str, Any]) -> dict[str, Any]:
    """Create a shallow-safe copy of a policy context."""
    if not isinstance(context, Mapping):
        raise TypeError("context must be a mapping")
    return dict(context)


__all__ = [
    "context_value",
    "freeze_context",
    "make_policy_id",
    "normalize_action",
    "normalize_field",
    "to_decimal",
]
