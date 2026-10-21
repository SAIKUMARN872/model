from __future__ import annotations

from decimal import Decimal


def validate_quota_limit(limit: int) -> int:
    """Validate a quota limit."""

    if not isinstance(limit, int):
        raise ValueError("Quota limit must be an integer")

    if limit <= 0:
        raise ValueError(
            "Quota limit must be greater than zero"
        )

    return limit


def validate_usage_amount(amount: int) -> int:
    """Validate a quota usage amount."""

    if not isinstance(amount, int):
        raise ValueError("Usage amount must be an integer")

    if amount < 0:
        raise ValueError(
            "Usage amount cannot be negative"
        )

    return amount


def calculate_remaining(
    limit: int,
    used: int,
    requested: int = 0,
) -> int:
    """Calculate quota remaining after projected usage."""

    validate_quota_limit(limit)
    validate_usage_amount(used)
    validate_usage_amount(requested)

    projected = used + requested

    return max(limit - projected, 0)


def calculate_utilization(
    limit: int,
    used: int,
    requested: int = 0,
) -> Decimal:
    """Calculate projected quota utilization."""

    validate_quota_limit(limit)
    validate_usage_amount(used)
    validate_usage_amount(requested)

    projected = used + requested

    return Decimal(projected) / Decimal(limit)


def would_exceed_quota(
    limit: int,
    used: int,
    requested: int,
) -> bool:
    """Return whether projected usage exceeds the quota."""

    validate_quota_limit(limit)
    validate_usage_amount(used)
    validate_usage_amount(requested)

    return used + requested > limit


def normalize_unit(unit: str) -> str:
    """Normalize and validate a quota unit."""

    if not unit or not unit.strip():
        raise ValueError(
            "Quota unit cannot be empty"
        )

    normalized = unit.strip().lower()

    allowed_units = {
        "tokens",
        "requests",
        "images",
        "audio_seconds",
        "compute_seconds",
        "credits",
    }

    if normalized not in allowed_units:
        raise ValueError(
            f"Unsupported quota unit: {unit}"
        )

    return normalized


def normalize_period(period: str) -> str:
    """Normalize and validate a quota period."""

    if not period or not period.strip():
        raise ValueError(
            "Quota period cannot be empty"
        )

    normalized = period.strip().lower()

    allowed_periods = {
        "hourly",
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "yearly",
    }

    if normalized not in allowed_periods:
        raise ValueError(
            f"Unsupported quota period: {period}"
        )

    return normalized


__all__ = [
    "validate_quota_limit",
    "validate_usage_amount",
    "calculate_remaining",
    "calculate_utilization",
    "would_exceed_quota",
    "normalize_unit",
    "normalize_period",
]
