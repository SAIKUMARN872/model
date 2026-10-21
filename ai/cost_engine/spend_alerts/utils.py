from __future__ import annotations

from decimal import Decimal, InvalidOperation

from .models import AlertSeverity


def to_decimal(value: Decimal | int | float | str) -> Decimal:
    """Convert a value to Decimal."""
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError(f"Invalid decimal value: {value}") from exc


def validate_threshold(
    threshold: Decimal | int | float | str,
) -> Decimal:
    """Validate a spend alert threshold."""
    value = to_decimal(threshold)

    if value < Decimal("0"):
        raise ValueError("threshold must not be negative")

    return value


def is_threshold_exceeded(
    current_spend: Decimal | int | float | str,
    threshold: Decimal | int | float | str,
) -> bool:
    """Return whether current spend has reached the threshold."""
    spend = to_decimal(current_spend)
    limit = validate_threshold(threshold)

    if spend < Decimal("0"):
        raise ValueError("current_spend must not be negative")

    return spend >= limit


def calculate_threshold_utilization(
    current_spend: Decimal | int | float | str,
    threshold: Decimal | int | float | str,
) -> Decimal:
    """Calculate spend as a percentage of the alert threshold."""
    spend = to_decimal(current_spend)
    limit = validate_threshold(threshold)

    if spend < Decimal("0"):
        raise ValueError("current_spend must not be negative")

    if limit == Decimal("0"):
        return Decimal("0") if spend == Decimal("0") else Decimal("100")

    return (spend / limit) * Decimal("100")


def validate_severity(
    severity: AlertSeverity | str,
) -> AlertSeverity:
    """Normalize and validate alert severity."""
    if isinstance(severity, AlertSeverity):
        return severity

    try:
        return AlertSeverity(str(severity).strip().lower())
    except ValueError as exc:
        raise ValueError(
            f"Invalid alert severity: {severity}"
        ) from exc


def build_alert_message(
    rule_name: str,
    current_spend: Decimal | int | float | str,
    threshold: Decimal | int | float | str,
    currency: str = "USD",
) -> str:
    """Build a consistent spend alert message."""
    spend = to_decimal(current_spend)
    limit = validate_threshold(threshold)

    if not rule_name.strip():
        raise ValueError("rule_name must not be empty")

    if not currency.strip():
        raise ValueError("currency must not be empty")

    return (
        f"Spend threshold exceeded for rule '{rule_name}': "
        f"{spend} {currency} >= {limit} {currency}"
    )


__all__ = [
    "to_decimal",
    "validate_threshold",
    "is_threshold_exceeded",
    "calculate_threshold_utilization",
    "validate_severity",
    "build_alert_message",
]
