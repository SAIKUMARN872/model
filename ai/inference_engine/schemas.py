from __future__ import annotations

from dataclasses import dataclass

from .models import (
    InferenceHealth,
    InferenceRequest,
    InferenceResult,
)


@dataclass(frozen=True)
class InferenceExecution:
    """Pair an inference request with its result."""

    request: InferenceRequest
    result: InferenceResult


@dataclass(frozen=True)
class InferenceHealthReport:
    """Aggregate backend health information."""

    results: list[InferenceHealth]

    @property
    def healthy_count(self) -> int:
        return sum(
            1
            for result in self.results
            if result.healthy
        )

    @property
    def unhealthy_count(self) -> int:
        return sum(
            1
            for result in self.results
            if not result.healthy
        )


__all__ = [
    "InferenceExecution",
    "InferenceHealthReport",
]
