from __future__ import annotations

from decimal import Decimal, InvalidOperation


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


def validate_amount(
    amount: Decimal | int | float | str,
) -> Decimal:
    """Validate a chargeback amount."""

    value = to_decimal(amount)

    if value < Decimal("0"):
        raise ValueError(
            "Chargeback amount cannot be negative"
        )

    return value


def validate_percentage(
    percentage: Decimal | int | float | str,
) -> Decimal:
    """Validate an allocation percentage."""

    value = to_decimal(percentage)

    if value < Decimal("0") or value > Decimal("100"):
        raise ValueError(
            "Percentage must be between 0 and 100"
        )

    return value


def calculate_allocation(
    total_amount: Decimal | int | float | str,
    percentage: Decimal | int | float | str,
) -> Decimal:
    """Calculate the amount assigned to an allocation."""

    amount = validate_amount(total_amount)
    percent = validate_percentage(percentage)

    return amount * percent / Decimal("100")


def validate_entity(
    entity_type: str,
    entity_id: str,
) -> tuple[str, str]:
    """Validate and normalize an entity reference."""

    if not entity_type or not entity_type.strip():
        raise ValueError(
            "entity_type cannot be empty"
        )

    if not entity_id or not entity_id.strip():
        raise ValueError(
            "entity_id cannot be empty"
        )

    return (
        entity_type.strip().lower(),
        entity_id.strip(),
    )


def validate_allocation_percentages(
    percentages: list[Decimal],
) -> None:
    """Ensure allocation percentages total exactly 100."""

    total = sum(percentages, Decimal("0"))

    if total != Decimal("100"):
        raise ValueError(
            f"Allocation percentages must total 100, got {total}"
        )


__all__ = [
    "to_decimal",
    "validate_amount",
    "validate_percentage",
    "calculate_allocation",
    "validate_entity",
    "validate_allocation_percentages",
]
