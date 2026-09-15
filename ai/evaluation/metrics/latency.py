"""
Latency metrics for AI evaluation.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class LatencyMetrics:
    """Latency statistics."""

    count: int
    average_ms: float
    minimum_ms: float
    maximum_ms: float
    p50_ms: float
    p95_ms: float
    p99_ms: float

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "count": self.count,
            "average_ms": self.average_ms,
            "minimum_ms": self.minimum_ms,
            "maximum_ms": self.maximum_ms,
            "p50_ms": self.p50_ms,
            "p95_ms": self.p95_ms,
            "p99_ms": self.p99_ms,
        }


class LatencyMetric:
    """Calculates latency statistics."""

    @staticmethod
    def calculate(
        latencies_ms: list[float],
    ) -> LatencyMetrics:

        values = sorted(
            float(value)
            for value in latencies_ms
        )

        if not values:

            return LatencyMetrics(
                count=0,
                average_ms=0.0,
                minimum_ms=0.0,
                maximum_ms=0.0,
                p50_ms=0.0,
                p95_ms=0.0,
                p99_ms=0.0,
            )

        return LatencyMetrics(
            count=len(values),
            average_ms=(
                sum(values)
                / len(values)
            ),
            minimum_ms=values[0],
            maximum_ms=values[-1],
            p50_ms=LatencyMetric.percentile(
                values,
                50,
            ),
            p95_ms=LatencyMetric.percentile(
                values,
                95,
            ),
            p99_ms=LatencyMetric.percentile(
                values,
                99,
            ),
        )

    @staticmethod
    def percentile(
        values: list[float],
        percentile: float,
    ) -> float:

        if not values:
            return 0.0

        if not 0 <= percentile <= 100:
            raise ValueError(
                "percentile must be between 0 and 100."
            )

        ordered = sorted(values)

        position = (
            percentile / 100
        ) * (
            len(ordered) - 1
        )

        lower = int(position)

        upper = min(
            lower + 1,
            len(ordered) - 1,
        )

        weight = (
            position - lower
        )

        return (
            ordered[lower]
            + (
                ordered[upper]
                - ordered[lower]
            )
            * weight
        )