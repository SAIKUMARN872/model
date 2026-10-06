from __future__ import annotations

from dataclasses import dataclass, field
from time import time
from typing import Any


@dataclass(frozen=True)
class BenchmarkCase:
    case_id: str
    task_type: str
    prompt: str
    expected_output: str | None = None
    required_capabilities: tuple[str, ...] = ()
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.case_id.strip():
            raise ValueError("case_id cannot be empty")

        if not self.task_type.strip():
            raise ValueError("task_type cannot be empty")

        if not self.prompt.strip():
            raise ValueError("prompt cannot be empty")


@dataclass(frozen=True)
class BenchmarkResult:
    case_id: str
    model_id: str
    provider: str
    tier: str
    quality_score: float
    latency_ms: float
    cost: float
    success: bool = True
    output: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: float = field(default_factory=time)

    def __post_init__(self) -> None:
        if not self.case_id.strip():
            raise ValueError("case_id cannot be empty")

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
            raise ValueError(
                "latency_ms cannot be negative"
            )

        if float(self.cost) < 0.0:
            raise ValueError(
                "cost cannot be negative"
            )


class BenchmarkSuite:
    def __init__(
        self,
        cases: list[BenchmarkCase] | None = None,
    ) -> None:
        self._cases: list[BenchmarkCase] = []

        if cases:
            self.add_many(cases)

    def add(self, case: BenchmarkCase) -> BenchmarkCase:
        if not isinstance(case, BenchmarkCase):
            raise TypeError(
                "case must be a BenchmarkCase instance"
            )

        self._cases.append(case)
        return case

    def add_many(
        self,
        cases: list[BenchmarkCase],
    ) -> int:
        if not isinstance(cases, list):
            raise TypeError("cases must be a list")

        for case in cases:
            if not isinstance(case, BenchmarkCase):
                raise TypeError(
                    "all cases must be BenchmarkCase instances"
                )

        self._cases.extend(cases)
        return len(cases)

    def cases(self) -> list[BenchmarkCase]:
        return list(self._cases)

    def get(
        self,
        case_id: str,
    ) -> BenchmarkCase | None:
        case_id = str(case_id).strip()

        for case in self._cases:
            if case.case_id == case_id:
                return case

        return None

    def count(self) -> int:
        return len(self._cases)

    def clear(self) -> int:
        count = len(self._cases)
        self._cases.clear()
        return count


class BenchmarkRunner:
    def __init__(
        self,
        suite: BenchmarkSuite,
    ) -> None:
        if not isinstance(suite, BenchmarkSuite):
            raise TypeError(
                "suite must be a BenchmarkSuite instance"
            )

        self._suite = suite

    @property
    def suite(self) -> BenchmarkSuite:
        return self._suite

    def record(
        self,
        result: BenchmarkResult,
    ) -> BenchmarkResult:
        if not isinstance(result, BenchmarkResult):
            raise TypeError(
                "result must be a BenchmarkResult instance"
            )

        if self._suite.get(result.case_id) is None:
            raise ValueError(
                f"unknown benchmark case: {result.case_id}"
            )

        return result

    def record_many(
        self,
        results: list[BenchmarkResult],
    ) -> int:
        for result in results:
            self.record(result)

        return len(results)


__all__ = [
    "BenchmarkCase",
    "BenchmarkResult",
    "BenchmarkRunner",
    "BenchmarkSuite",
]
