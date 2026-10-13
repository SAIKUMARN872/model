from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping

from .utils import unique_ids


@dataclass(frozen=True, slots=True)
class BenchmarkCase:
    query: str
    relevant_document_ids: tuple[str, ...]
    case_id: str = ""
    filters: Mapping[str, Any] = field(default_factory=dict)
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.query, str) or not self.query.strip():
            raise ValueError("Benchmark query must not be empty")

        ids = unique_ids(self.relevant_document_ids)
        object.__setattr__(self, "relevant_document_ids", tuple(ids))

        if not isinstance(self.case_id, str):
            raise TypeError("case_id must be a string")


@dataclass(frozen=True, slots=True)
class BenchmarkReport:
    total_cases: int
    metrics: Mapping[str, float]
    results: tuple[Mapping[str, Any], ...] = ()
