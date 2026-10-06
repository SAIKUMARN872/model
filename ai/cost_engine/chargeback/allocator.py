from __future__ import annotations

from decimal import Decimal
from typing import Iterable

from .calculator import ChargebackCalculator
from .models import ChargebackAllocation
from .utils import validate_amount


class ChargebackAllocator:
    """Allocates AI costs across enterprise entities."""

    def __init__(
        self,
        calculator: ChargebackCalculator | None = None,
    ) -> None:
        self.calculator = calculator or ChargebackCalculator()

    def allocate(
        self,
        total_amount: Decimal,
        allocations: Iterable[
            tuple[str, str, Decimal]
        ],
    ) -> list[ChargebackAllocation]:
        """Allocate a total cost according to percentages."""

        amount = validate_amount(total_amount)

        allocation_list = list(allocations)

        return self.calculator.calculate(
            total_amount=amount,
            allocations=allocation_list,
        )

    def allocate_equal(
        self,
        total_amount: Decimal,
        entities: Iterable[tuple[str, str]],
    ) -> list[ChargebackAllocation]:
        """Allocate a cost equally across entities."""

        amount = validate_amount(total_amount)
        entity_list = list(entities)

        if not entity_list:
            raise ValueError(
                "At least one entity is required"
            )

        count = len(entity_list)
        percentage = (
            Decimal("100") / Decimal(count)
        )

        # Use the first allocations as the base and
        # correct the final percentage for Decimal precision.
        percentages = [
            percentage for _ in entity_list
        ]

        percentages[-1] = (
            Decimal("100")
            - sum(percentages[:-1], Decimal("0"))
        )

        allocations = [
            (
                entity_type,
                entity_id,
                allocation_percentage,
            )
            for (
                entity_type,
                entity_id,
            ), allocation_percentage in zip(
                entity_list,
                percentages,
            )
        ]

        return self.calculator.calculate(
            total_amount=amount,
            allocations=allocations,
        )


__all__ = [
    "ChargebackAllocator",
]
