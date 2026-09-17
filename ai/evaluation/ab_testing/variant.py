"""
A/B test variant definitions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
from uuid import uuid4


@dataclass
class VariantResult:
    """Result produced by one variant."""

    variant_id: str

    score: float

    latency_ms: float = 0.0

    cost: float = 0.0

    success: bool = True

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class Variant:
    """
    Represents an A/B test variant.

    Example:
        Variant("model-a", traffic_percentage=50)
    """

    name: str

    variant_id: str = field(
        default_factory=lambda:
        f"variant_{uuid4().hex}"
    )

    traffic_percentage: float = 50.0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    results: list[VariantResult] = field(
        default_factory=list
    )

    def __post_init__(self) -> None:

        self.name = self.name.strip()

        if not self.name:
            raise ValueError(
                "Variant name cannot be empty."
            )

        if not 0 <= self.traffic_percentage <= 100:
            raise ValueError(
                "traffic_percentage must be between 0 and 100."
            )

    def add_result(
        self,
        result: VariantResult,
    ) -> None:

        if result.variant_id != self.variant_id:
            raise ValueError(
                "Result belongs to another variant."
            )

        self.results.append(result)

    @property
    def sample_count(self) -> int:

        return len(self.results)

    @property
    def average_score(self) -> float:

        if not self.results:
            return 0.0

        return sum(
            result.score
            for result in self.results
        ) / len(self.results)

    @property
    def average_latency_ms(self) -> float:

        if not self.results:
            return 0.0

        return sum(
            result.latency_ms
            for result in self.results
        ) / len(self.results)

    @property
    def total_cost(self) -> float:

        return sum(
            result.cost
            for result in self.results
        )

    @property
    def success_rate(self) -> float:

        if not self.results:
            return 0.0

        successful = sum(
            1
            for result in self.results
            if result.success
        )

        return successful / len(
            self.results
        )

    def summary(self) -> dict[str, Any]:

        return {
            "variant_id": self.variant_id,
            "name": self.name,
            "traffic_percentage":
                self.traffic_percentage,
            "sample_count":
                self.sample_count,
            "average_score":
                self.average_score,
            "average_latency_ms":
                self.average_latency_ms,
            "total_cost":
                self.total_cost,
            "success_rate":
                self.success_rate,
        }