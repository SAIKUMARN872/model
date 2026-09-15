"""
Cost metrics for AI model evaluation.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class CostMetrics:
    """Cost-related evaluation metrics."""

    total_cost: float
    request_count: int
    input_tokens: int
    output_tokens: int

    @property
    def average_cost(self) -> float:

        if self.request_count == 0:
            return 0.0

        return (
            self.total_cost
            / self.request_count
        )

    @property
    def total_tokens(self) -> int:

        return (
            self.input_tokens
            + self.output_tokens
        )

    @property
    def cost_per_1k_tokens(self) -> float:

        if self.total_tokens == 0:
            return 0.0

        return (
            self.total_cost
            / self.total_tokens
            * 1000
        )

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "total_cost":
                self.total_cost,
            "request_count":
                self.request_count,
            "input_tokens":
                self.input_tokens,
            "output_tokens":
                self.output_tokens,
            "total_tokens":
                self.total_tokens,
            "average_cost":
                self.average_cost,
            "cost_per_1k_tokens":
                self.cost_per_1k_tokens,
        }


class CostMetric:
    """Calculates model usage costs."""

    @staticmethod
    def calculate(
        costs: list[float],
        input_tokens: list[int] | None = None,
        output_tokens: list[int] | None = None,
    ) -> CostMetrics:

        input_tokens = (
            input_tokens or []
        )

        output_tokens = (
            output_tokens or []
        )

        if input_tokens and len(
            input_tokens
        ) != len(costs):

            raise ValueError(
                "input_tokens length must match costs."
            )

        if output_tokens and len(
            output_tokens
        ) != len(costs):

            raise ValueError(
                "output_tokens length must match costs."
            )

        return CostMetrics(
            total_cost=sum(
                float(cost)
                for cost in costs
            ),
            request_count=len(costs),
            input_tokens=sum(
                input_tokens
            ),
            output_tokens=sum(
                output_tokens
            ),
        )