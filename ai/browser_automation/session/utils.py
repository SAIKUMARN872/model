from datetime import datetime, timezone
import math


def utc_now() -> datetime:
    """Return a timezone-aware UTC timestamp."""
    return datetime.now(timezone.utc)


def validate_identifier(value: str, name: str) -> str:
    """Validate a required user, task, or session identifier."""
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{name} must be a non-empty string.")
    return value.strip()


def validate_ttl(ttl_seconds: float) -> float:
    """Require a finite, positive session lifetime."""
    if isinstance(ttl_seconds, bool):
        raise ValueError("Session TTL must be a positive finite number.")
    try:
        ttl = float(ttl_seconds)
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError(
            "Session TTL must be a positive finite number."
        ) from exc

    if not math.isfinite(ttl) or ttl <= 0:
        raise ValueError("Session TTL must be a positive finite number.")

    return ttl
