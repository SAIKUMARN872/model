"""Deterministic, namespaced cache-key utilities."""

from __future__ import annotations

import hashlib
import json
import re
from collections.abc import Mapping
from typing import Any


def make_cache_key(
    namespace: str,
    value: str | Mapping[str, Any],
    *,
    version: str = "v1",
) -> str:
    if not isinstance(namespace, str) or not namespace.strip():
        raise ValueError("Cache namespace must be a non-empty string.")
    if not isinstance(version, str) or not version.strip():
        raise ValueError("Cache version must be a non-empty string.")

    safe_namespace = re.sub(r"[^a-zA-Z0-9:_-]+", "-", namespace.strip())
    safe_version = re.sub(r"[^a-zA-Z0-9_-]+", "-", version.strip())

    if isinstance(value, str):
        canonical = value
    elif isinstance(value, Mapping):
        try:
            canonical = json.dumps(
                value,
                sort_keys=True,
                separators=(",", ":"),
                ensure_ascii=False,
                allow_nan=False,
            )
        except (TypeError, ValueError) as exc:
            raise ValueError(
                "Cache-key mappings must contain valid JSON values."
            ) from exc
    else:
        raise TypeError("Cache-key input must be a string or mapping.")

    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return f"{safe_namespace}:{safe_version}:{digest}"


def serialize_json(value: Any) -> bytes:
    """Serialize JSON-compatible cache values to UTF-8 bytes."""
    try:
        return json.dumps(
            value,
            ensure_ascii=False,
            separators=(",", ":"),
            allow_nan=False,
        ).encode("utf-8")
    except (TypeError, ValueError) as exc:
        raise ValueError("Cache value is not valid JSON data.") from exc


def deserialize_json(value: bytes | str) -> Any:
    """Decode a JSON cache value."""
    if isinstance(value, bytes):
        value = value.decode("utf-8")
    if not isinstance(value, str):
        raise TypeError("Serialized cache value must be bytes or string.")
    return json.loads(value)


__all__ = ["make_cache_key", "serialize_json", "deserialize_json"]
