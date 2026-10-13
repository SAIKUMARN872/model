"""TTL policy and expiration helpers for the ModelNow RAG cache."""

from __future__ import annotations

import math
import time
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class TTLPolicy:
    default_ttl_seconds: float = 300.0
    min_ttl_seconds: float = 0.001
    max_ttl_seconds: float = 604800.0

    def __post_init__(self) -> None:
        values = (
            self.default_ttl_seconds,
            self.min_ttl_seconds,
            self.max_ttl_seconds,
        )
        if any(
            isinstance(value, bool)
            or not isinstance(value, (int, float))
            or not math.isfinite(value)
            for value in values
        ):
            raise ValueError("TTL policy values must be finite numbers.")

        if self.min_ttl_seconds <= 0:
            raise ValueError("Minimum TTL must be positive.")
        if self.max_ttl_seconds < self.min_ttl_seconds:
            raise ValueError("Maximum TTL cannot be below minimum TTL.")
        if not self.min_ttl_seconds <= self.default_ttl_seconds <= self.max_ttl_seconds:
            raise ValueError("Default TTL must be within the configured TTL range.")

    def resolve(self, ttl_seconds: float | None = None) -> float:
        ttl = self.default_ttl_seconds if ttl_seconds is None else ttl_seconds

        if (
            isinstance(ttl, bool)
            or not isinstance(ttl, (int, float))
            or not math.isfinite(ttl)
        ):
            raise ValueError("TTL must be a finite number.")

        ttl = float(ttl)
        if not self.min_ttl_seconds <= ttl <= self.max_ttl_seconds:
            raise ValueError(
                f"TTL must be between {self.min_ttl_seconds} and "
                f"{self.max_ttl_seconds} seconds."
            )

        return ttl


def expiration_time(ttl_seconds: float, *, now: float | None = None) -> float:
    """Return a monotonic-clock expiration deadline."""
    if (
        isinstance(ttl_seconds, bool)
        or not isinstance(ttl_seconds, (int, float))
        or not math.isfinite(ttl_seconds)
        or ttl_seconds <= 0
    ):
        raise ValueError("TTL must be a finite positive number.")

    base = time.monotonic() if now is None else now
    if not math.isfinite(base):
        raise ValueError("The base time must be finite.")

    return base + float(ttl_seconds)


def is_expired(expires_at: float, *, now: float | None = None) -> bool:
    """Check expiry using a monotonic clock."""
    current = time.monotonic() if now is None else now
    return current >= expires_at


__all__ = ["TTLPolicy", "expiration_time", "is_expired"]
