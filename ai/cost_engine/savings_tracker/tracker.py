from __future__ import annotations

from decimal import Decimal
from typing import Dict, List, Optional

from .models import SavingsRecord, SavingsSummary


class SavingsTracker:
    """Tracks realized savings from ModelNow optimizations."""

    def __init__(self) -> None:
        self._records: Dict[str, SavingsRecord] = {}

    def record(self, record: SavingsRecord) -> SavingsRecord:
        if not record.savings_id.strip():
            raise ValueError("savings_id must not be empty")

        if record.baseline_cost < Decimal("0"):
            raise ValueError("baseline_cost must not be negative")

        if record.optimized_cost < Decimal("0"):
            raise ValueError("optimized_cost must not be negative")

        if record.savings_amount < Decimal("0"):
            raise ValueError("savings_amount must not be negative")

        self._records[record.savings_id] = record
        return record

    def get(self, savings_id: str) -> Optional[SavingsRecord]:
        return self._records.get(savings_id)

    def require(self, savings_id: str) -> SavingsRecord:
        record = self.get(savings_id)

        if record is None:
            raise KeyError(f"Savings record not found: {savings_id}")

        return record

    def list_records(self) -> List[SavingsRecord]:
        return list(self._records.values())

    def total_savings(self) -> Decimal:
        return sum(
            (record.savings_amount for record in self._records.values()),
            Decimal("0"),
        )

    def total_baseline_cost(self) -> Decimal:
        return sum(
            (record.baseline_cost for record in self._records.values()),
            Decimal("0"),
        )

    def total_optimized_cost(self) -> Decimal:
        return sum(
            (record.optimized_cost for record in self._records.values()),
            Decimal("0"),
        )

    def summarize(self, currency: str = "USD") -> SavingsSummary:
        baseline = self.total_baseline_cost()
        optimized = self.total_optimized_cost()
        savings = self.total_savings()

        percentage = (
            (savings / baseline) * Decimal("100")
            if baseline > Decimal("0")
            else Decimal("0")
        )

        return SavingsSummary(
            baseline_cost=baseline,
            optimized_cost=optimized,
            savings_amount=savings,
            savings_percentage=percentage,
            currency=currency,
            record_count=len(self._records),
        )

    def count(self) -> int:
        return len(self._records)

    def clear(self) -> None:
        self._records.clear()


__all__ = ["SavingsTracker"]
