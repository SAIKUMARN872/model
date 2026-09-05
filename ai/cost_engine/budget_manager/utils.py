from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP


def money(value: Decimal | float | int | str) -> Decimal:
    """
    Normalize monetary values to two decimal places.
    """

    return Decimal(str(value)).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def utilization(
    spent: Decimal,
    budget: Decimal,
) -> Decimal:

    if budget <= 0:
        return Decimal("0")

    return (
        spent / budget * Decimal("100")
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def remaining(
    budget: Decimal,
    spent: Decimal,
    reserved: Decimal = Decimal("0"),
) -> Decimal:

    return max(
        Decimal("0"),
        budget - spent - reserved,
    )