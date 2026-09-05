from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Dict, Iterable, List


class AllocationError(ValueError):
    """Raised when a chargeback allocation is invalid."""


@dataclass(frozen=True)
class AllocationRule:
    """
    Defines how a cost should be allocated.

    weight:
        Relative allocation weight.

    percentage:
        Optional explicit percentage from 0 to 100.
    """

    target_id: str
    weight: Decimal = Decimal("1")
    percentage: Decimal | None = None
    metadata: Dict[str, str] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.target_id:
            raise AllocationError("target_id cannot be empty")

        if self.weight < 0:
            raise AllocationError("weight cannot be negative")

        if self.percentage is not None:
            if self.percentage < 0 or self.percentage > 100:
                raise AllocationError(
                    "percentage must be between 0 and 100"
                )


@dataclass(frozen=True)
class AllocationResult:
    target_id: str
    amount: Decimal
    percentage: Decimal


class CostAllocator:
    """
    Allocates a total cost across multiple targets.

    Example:

        rules = [
            AllocationRule("team-a", percentage=Decimal("60")),
            AllocationRule("team-b", percentage=Decimal("40")),
        ]

        result = allocator.allocate(
            Decimal("100"),
            rules,
        )
    """

    def allocate(
        self,
        total_cost: Decimal,
        rules: Iterable[AllocationRule],
    ) -> List[AllocationResult]:

        total_cost = Decimal(str(total_cost))

        if total_cost < 0:
            raise AllocationError("total_cost cannot be negative")

        rules = list(rules)

        if not rules:
            raise AllocationError("At least one allocation rule is required")

        explicit_rules = [
            rule for rule in rules
            if rule.percentage is not None
        ]

        weighted_rules = [
            rule for rule in rules
            if rule.percentage is None
        ]

        if explicit_rules and weighted_rules:
            raise AllocationError(
                "Cannot mix percentage and weight based allocation"
            )

        if explicit_rules:
            return self._allocate_by_percentage(
                total_cost,
                explicit_rules,
            )

        return self._allocate_by_weight(
            total_cost,
            weighted_rules,
        )

    def _allocate_by_percentage(
        self,
        total_cost: Decimal,
        rules: List[AllocationRule],
    ) -> List[AllocationResult]:

        percentage_total = sum(
            rule.percentage or Decimal("0")
            for rule in rules
        )

        if percentage_total != Decimal("100"):
            raise AllocationError(
                f"Allocation percentages must total 100. "
                f"Got {percentage_total}"
            )

        results: List[AllocationResult] = []
        allocated = Decimal("0")

        for index, rule in enumerate(rules):
            percentage = rule.percentage or Decimal("0")

            if index == len(rules) - 1:
                amount = total_cost - allocated
            else:
                amount = (
                    total_cost * percentage / Decimal("100")
                ).quantize(Decimal("0.0001"))

            allocated += amount

            results.append(
                AllocationResult(
                    target_id=rule.target_id,
                    amount=amount,
                    percentage=percentage,
                )
            )

        return results

    def _allocate_by_weight(
        self,
        total_cost: Decimal,
        rules: List[AllocationRule],
    ) -> List[AllocationResult]:

        total_weight = sum(
            rule.weight for rule in rules
        )

        if total_weight <= 0:
            raise AllocationError(
                "Total allocation weight must be greater than zero"
            )

        results: List[AllocationResult] = []
        allocated = Decimal("0")

        for index, rule in enumerate(rules):

            percentage = (
                rule.weight / total_weight
            ) * Decimal("100")

            if index == len(rules) - 1:
                amount = total_cost - allocated
            else:
                amount = (
                    total_cost * rule.weight / total_weight
                ).quantize(Decimal("0.0001"))

            allocated += amount

            results.append(
                AllocationResult(
                    target_id=rule.target_id,
                    amount=amount,
                    percentage=percentage,
                )
            )

        return results