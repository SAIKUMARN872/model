"""TTL validation helpers for memory caches."""

from __future__ import annotations

import math

from ..exceptions import MemoryValidationError


def normalize_ttl(value: float | int | None) -> float | None:
    """Validate TTL seconds; None means no expiry, zero means immediate expiry."""
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise MemoryValidationError("TTL must be a number or None")
    result = float(value)
    if not math.isfinite(result) or result < 0:
        raise MemoryValidationError("TTL must be finite and non-negative")
    return result


def expiration_time(now: float, ttl_seconds: float | int | None) -> float | None:
    """Return a monotonic expiration deadline."""
    ttl = normalize_ttl(ttl_seconds)
    if ttl is None:
        return None
    return now + ttl
