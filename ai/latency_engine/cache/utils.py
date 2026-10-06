from __future__ import annotations

import hashlib
import json
from time import time
from typing import Any


def normalize_key(value: object) -> str:
    """Normalize a cache-key component."""
    return str(value).strip()


def build_cache_key(
    *,
    model_id: str,
    provider: str,
    messages: list[dict[str, Any]],
    metadata: dict[str, Any] | None = None,
) -> str:
    """Build a deterministic cache key for an inference request."""

    model = normalize_key(model_id)
    provider_name = normalize_key(provider)

    if not model:
        raise ValueError("model_id cannot be empty")

    if not provider_name:
        raise ValueError("provider cannot be empty")

    payload = {
        "model_id": model,
        "provider": provider_name,
        "messages": messages,
        "metadata": metadata or {},
    }

    serialized = json.dumps(
        payload,
        sort_keys=True,
        separators=(",", ":"),
        default=str,
    )

    digest = hashlib.sha256(
        serialized.encode("utf-8")
    ).hexdigest()

    return f"modelnow:latency:{digest}"


def is_expired(
    created_at: float,
    ttl_seconds: float,
    now: float | None = None,
) -> bool:
    """Determine whether a cached item has expired."""

    if ttl_seconds <= 0.0:
        raise ValueError(
            "ttl_seconds must be greater than zero"
        )

    current_time = time() if now is None else float(now)

    return current_time >= (
        float(created_at) + float(ttl_seconds)
    )


def remaining_ttl(
    created_at: float,
    ttl_seconds: float,
    now: float | None = None,
) -> float:
    """Return remaining cache lifetime in seconds."""

    if ttl_seconds <= 0.0:
        raise ValueError(
            "ttl_seconds must be greater than zero"
        )

    current_time = time() if now is None else float(now)

    remaining = (
        float(created_at)
        + float(ttl_seconds)
        - current_time
    )

    return max(0.0, remaining)


def serialize_value(value: Any) -> str:
    """Serialize a cache value deterministically."""
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        default=str,
    )


def deserialize_value(value: str) -> Any:
    """Deserialize a serialized cache value."""
    return json.loads(value)


__all__ = [
    "normalize_key",
    "build_cache_key",
    "is_expired",
    "remaining_ttl",
    "serialize_value",
    "deserialize_value",
]
