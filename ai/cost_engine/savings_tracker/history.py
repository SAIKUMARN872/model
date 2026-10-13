from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from .models import SavingsRecord


class SavingsHistory:
    """Maintains historical savings records."""

    def __init__(self) -> None:
        self._records: List[SavingsRecord] = []

    def add(self, record: SavingsRecord) -> SavingsRecord:
        self._records.append(record)
        return record

    def get(self, savings_id: str) -> Optional[SavingsRecord]:
        for record in self._records:
            if record.savings_id == savings_id:
                return record
        return None

    def list_records(self) -> List[SavingsRecord]:
        return list(self._records)

    def by_model(self, model: str) -> List[SavingsRecord]:
        return [
            record
            for record in self._records
            if record.model == model
        ]

    def by_optimized_model(self, model: str) -> List[SavingsRecord]:
        return [
            record
            for record in self._records
            if record.optimized_model == model
        ]

    def by_request(self, request_id: str) -> List[SavingsRecord]:
        return [
            record
            for record in self._records
            if record.request_id == request_id
        ]

    def between(
        self,
        start: datetime,
        end: datetime,
    ) -> List[SavingsRecord]:
        return [
            record
            for record in self._records
            if start <= record.timestamp <= end
        ]

    def count(self) -> int:
        return len(self._records)

    def clear(self) -> None:
        self._records.clear()


__all__ = ["SavingsHistory"]
