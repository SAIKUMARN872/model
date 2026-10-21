from __future__ import annotations

from decimal import Decimal

from .models import ChargebackAllocation
from .utils import (
    calculate_allocation,
    validate_allocation_percentages,
    validate_amount,
    validate_entity,
    validate_percentage,
)


class ChargebackCalculator:
    """Calculates cost allocations across enterprise entities."""

    def calculate(
        self,
        total_amount: Decimal,
        allocations: list[tuple[str, str, Decimal]],
    ) -> list[ChargebackAllocation]:
        """
        Calculate allocated amounts.

        Each allocation is:
            (entity_type, entity_id, percentage)

        Percentages must total exactly 100.
        """

        amount = validate_amount(total_amount)

        if not allocations:
            raise ValueError(
                "At least one allocation is required"
            )

        normalized: list[tuple[str, str, Decimal]] = []

        for entity_type, entity_id, percentage in allocations:
            normalized_type, normalized_id = validate_entity(
                entity_type,
                entity_id,
            )
            normalized_percentage = validate_percentage(
                percentage
            )

            normalized.append(
                (
                    normalized_type,
                    normalized_id,
                    normalized_percentage,
                )
            )

        validate_allocation_percentages(
            [item[2] for item in normalized]
        )

        return [
            ChargebackAllocation(
                entity_type=entity_type,
                entity_id=entity_id,
                amount=calculate_allocation(
                    amount,
                    percentage,
                ),
                percentage=percentage,
            )
            for entity_type, entity_id, percentage in normalized
        ]

    def calculate_single(
        self,
        total_amount: Decimal,
        entity_type: str,
        entity_id: str,
        percentage: Decimal = Decimal("100"),
    ) -> ChargebackAllocation:
        """Calculate a single-entity allocation."""

        allocations = self.calculate(
            total_amount=total_amount,
            allocations=[
                (
                    entity_type,
                    entity_id,
                    percentage,
                )
            ],
        )

        return allocations[0]


__all__ = [
    "ChargebackCalculator",
]
