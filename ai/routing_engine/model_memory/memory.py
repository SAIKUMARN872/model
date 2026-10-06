from __future__ import annotations

from dataclasses import dataclass, field
from threading import Lock
from time import time
from typing import Any


@dataclass(frozen=True)
class MemoryRecord:
    """A persistent routing-performance observation."""

    request_id: str
    model_id: str
    provider: str
    tier: str
    quality_score: float
    latency_ms: float
    cost: float
    success: bool = True
    task_type: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: float = field(default_factory=time)

    def __post_init__(self) -> None:
        if not self.request_id.strip():
            raise ValueError("request_id cannot be empty")

        if not self.model_id.strip():
            raise ValueError("model_id cannot be empty")

        if not self.provider.strip():
            raise ValueError("provider cannot be empty")

        if not self.tier.strip():
            raise ValueError("tier cannot be empty")

        if not 0.0 <= float(self.quality_score) <= 1.0:
            raise ValueError(
                "quality_score must be between 0.0 and 1.0"
            )

        if float(self.latency_ms) < 0.0:
            raise ValueError("latency_ms cannot be negative")

        if float(self.cost) < 0.0:
            raise ValueError("cost cannot be negative")


class ModelMemory:
    """Thread-safe in-memory store for routing observations."""

    def __init__(self, max_records: int = 10_000) -> None:
        if max_records <= 0:
            raise ValueError("max_records must be greater than zero")

        self._max_records = int(max_records)
        self._records: list[MemoryRecord] = []
        self._lock = Lock()

    @property
    def max_records(self) -> int:
        return self._max_records

    def add(self, record: MemoryRecord) -> MemoryRecord:
        if not isinstance(record, MemoryRecord):
            raise TypeError("record must be a MemoryRecord instance")

        with self._lock:
            self._records.append(record)

            if len(self._records) > self._max_records:
                overflow = len(self._records) - self._max_records
                del self._records[:overflow]

        return record

    def add_many(
        self,
        records: list[MemoryRecord],
    ) -> int:
        if not isinstance(records, list):
            raise TypeError("records must be a list")

        for record in records:
            if not isinstance(record, MemoryRecord):
                raise TypeError(
                    "all records must be MemoryRecord instances"
                )

        with self._lock:
            self._records.extend(records)

            if len(self._records) > self._max_records:
                overflow = len(self._records) - self._max_records
                del self._records[:overflow]

        return len(records)

    def get(self, request_id: str) -> MemoryRecord | None:
        request_id = str(request_id).strip()

        with self._lock:
            for record in reversed(self._records):
                if record.request_id == request_id:
                    return record

        return None

    def records(self) -> list[MemoryRecord]:
        with self._lock:
            return list(self._records)

    def count(self) -> int:
        with self._lock:
            return len(self._records)

    def clear(self) -> int:
        with self._lock:
            count = len(self._records)
            self._records.clear()
            return count

    def recent(self, limit: int = 10) -> list[MemoryRecord]:
        if limit <= 0:
            return []

        with self._lock:
            return list(reversed(self._records[-limit:]))

    def model_records(
        self,
        model_id: str,
        limit: int | None = None,
    ) -> list[MemoryRecord]:
        model_id = str(model_id).strip()

        with self._lock:
            matches = [
                record
                for record in reversed(self._records)
                if record.model_id == model_id
            ]

        if limit is not None:
            if limit <= 0:
                return []
            matches = matches[:limit]

        return matches


__all__ = [
    "MemoryRecord",
    "ModelMemory",
]
