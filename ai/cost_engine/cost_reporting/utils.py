from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Iterable

from .models import CostReportEntry


def to_decimal(
    value: Decimal | int | float | str,
) -> Decimal:
    """Convert a value to a finite Decimal."""

    try:
        result = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError(
            f"Invalid decimal value: {value!r}"
        ) from exc

    if not result.is_finite():
        raise ValueError(
            "Value must be finite"
        )

    return result


def validate_report_id(
    report_id: str,
) -> str:
    """Validate and normalize a report identifier."""

    if not report_id or not report_id.strip():
        raise ValueError(
            "report_id cannot be empty"
        )

    return report_id.strip()


def validate_currency(
    currency: str,
) -> str:
    """Validate and normalize a currency code."""

    if not currency or not currency.strip():
        raise ValueError(
            "currency cannot be empty"
        )

    normalized = currency.strip().upper()

    if len(normalized) != 3:
        raise ValueError(
            "currency must be a 3-letter code"
        )

    return normalized


def calculate_total_cost(
    entries: Iterable[CostReportEntry],
) -> Decimal:
    """Calculate total cost from report entries."""

    return sum(
        (
            entry.amount
            for entry in entries
        ),
        Decimal("0"),
    )


def calculate_total_requests(
    entries: Iterable[CostReportEntry],
) -> int:
    """Calculate total request count."""

    return sum(
        entry.request_count
        for entry in entries
    )


def calculate_total_tokens(
    entries: Iterable[CostReportEntry],
) -> int:
    """Calculate total token count."""

    return sum(
        entry.token_count
        for entry in entries
    )


def calculate_average_cost(
    total_cost: Decimal,
    count: int,
) -> Decimal:
    """Calculate average cost per item."""

    if count <= 0:
        return Decimal("0")

    return total_cost / Decimal(count)


def calculate_cost_share(
    entity_cost: Decimal,
    total_cost: Decimal,
) -> Decimal:
    """Calculate an entity's percentage share of total cost."""

    total = to_decimal(total_cost)
    entity = to_decimal(entity_cost)

    if total <= Decimal("0"):
        return Decimal("0")

    if entity < Decimal("0"):
        raise ValueError(
            "entity_cost cannot be negative"
        )

    return (
        entity
        / total
        * Decimal("100")
    )


__all__ = [
    "to_decimal",
    "validate_report_id",
    "validate_currency",
    "calculate_total_cost",
    "calculate_total_requests",
    "calculate_total_tokens",
    "calculate_average_cost",
    "calculate_cost_share",
]
