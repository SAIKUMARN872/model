"""Safe cache key and namespace helpers."""

from __future__ import annotations

import hashlib

from ..exceptions import MemoryValidationError
from ..utils import validate_identifier


def validate_bounded_identifier(
    value: str,
    *,
    field: str,
    max_length: int,
) -> str:
    """Validate an identifier using the shared contract plus a local size bound."""
    if isinstance(max_length, bool) or not isinstance(max_length, int) or max_length < 1:
        raise MemoryValidationError("max_length must be a positive integer")

    result = validate_identifier(value, field=field)
    if len(result) > max_length:
        raise MemoryValidationError(
            f"{field} must not exceed {max_length} characters"
        )
    return result


def namespaced_key(namespace: str, key: str) -> str:
    """Build a stable cache key without exposing the original key in Redis."""
    namespace = validate_bounded_identifier(
        namespace, field="namespace", max_length=128
    )
    key = validate_bounded_identifier(key, field="key", max_length=2048)
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return f"modelnow:{namespace}:{digest}"
