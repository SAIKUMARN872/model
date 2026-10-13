from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any


def _to_decimal(value: Any, default: Decimal = Decimal("0")) -> Decimal:
    if isinstance(value, Decimal):
        return value

    try:
        return Decimal(str(value))
    except (TypeError, ValueError):
        return default


def _clamp(
    value: Decimal,
    minimum: Decimal = Decimal("0"),
    maximum: Decimal = Decimal("1"),
) -> Decimal:
    if minimum > maximum:
        raise ValueError(
            "minimum must not be greater than maximum"
        )

    return max(
        minimum,
        min(value, maximum),
    )


@dataclass(frozen=True)
class BenchmarkMetrics:
    """Standardized metrics for one benchmark execution."""

    latency_ms: Decimal = Decimal("0")
    cost: Decimal = Decimal("0")
    quality_score: Decimal = Decimal("0")
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    throughput_tokens_per_second: Decimal = Decimal("0")
    success_rate: Decimal = Decimal("1")
    error_rate: Decimal = Decimal("0")

    def __post_init__(self) -> None:
        object.__setattr__(
            self,
            "latency_ms",
            max(
                Decimal("0"),
                _to_decimal(self.latency_ms),
            ),
        )

        object.__setattr__(
            self,
            "cost",
            max(
                Decimal("0"),
                _to_decimal(self.cost),
            ),
        )

        object.__setattr__(
            self,
            "quality_score",
            _clamp(
                _to_decimal(self.quality_score)
            ),
        )

        input_tokens = max(
            0,
            int(self.input_tokens),
        )

        output_tokens = max(
            0,
            int(self.output_tokens),
        )

        total_tokens = max(
            0,
            int(self.total_tokens),
        )

        if total_tokens == 0:
            total_tokens = (
                input_tokens + output_tokens
            )

        object.__setattr__(
            self,
            "input_tokens",
            input_tokens,
        )

        object.__setattr__(
            self,
            "output_tokens",
            output_tokens,
        )

        object.__setattr__(
            self,
            "total_tokens",
            total_tokens,
        )

        throughput = _to_decimal(
            self.throughput_tokens_per_second
        )

        if throughput <= Decimal("0") and total_tokens > 0:
            latency = max(
                Decimal("0"),
                _to_decimal(self.latency_ms),
            )

            if latency > Decimal("0"):
                throughput = (
                    Decimal(total_tokens)
                    / latency
                    * Decimal("1000")
                )

        object.__setattr__(
            self,
            "throughput_tokens_per_second",
            max(
                Decimal("0"),
                throughput,
            ),
        )

        object.__setattr__(
            self,
            "success_rate",
            _clamp(
                _to_decimal(
                    self.success_rate,
                    Decimal("1"),
                )
            ),
        )

        object.__setattr__(
            self,
            "error_rate",
            _clamp(
                _to_decimal(
                    self.error_rate
                )
            ),
        )

    @property
    def tokens_per_second(self) -> Decimal:
        """Return the measured throughput."""
        return self.throughput_tokens_per_second

    @property
    def normalized_latency(self) -> Decimal:
        """Return latency as a non-negative metric value."""
        return self.latency_ms

    @property
    def normalized_cost(self) -> Decimal:
        """Return cost as a non-negative metric value."""
        return self.cost

    @property
    def is_successful(self) -> bool:
        """Return whether the benchmark execution succeeded."""
        return self.success_rate > Decimal("0")

    def as_dict(self) -> dict[str, Any]:
        """Serialize metrics into a simple dictionary."""
        return {
            "latency_ms": str(self.latency_ms),
            "cost": str(self.cost),
            "quality_score": str(self.quality_score),
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "total_tokens": self.total_tokens,
            "throughput_tokens_per_second": str(
                self.throughput_tokens_per_second
            ),
            "success_rate": str(self.success_rate),
            "error_rate": str(self.error_rate),
        }


@dataclass(frozen=True)
class BenchmarkMetricSummary:
    """Aggregated statistics for a benchmark metric."""

    count: int
    minimum: Decimal
    maximum: Decimal
    average: Decimal
    total: Decimal

    @classmethod
    def from_values(
        cls,
        values: list[Any],
    ) -> BenchmarkMetricSummary:
        if not values:
            return cls(
                count=0,
                minimum=Decimal("0"),
                maximum=Decimal("0"),
                average=Decimal("0"),
                total=Decimal("0"),
            )

        decimals = [
            _to_decimal(value)
            for value in values
        ]

        total = sum(
            decimals,
            Decimal("0"),
        )

        count = len(decimals)

        return cls(
            count=count,
            minimum=min(decimals),
            maximum=max(decimals),
            average=total / Decimal(count),
            total=total,
        )

    def as_dict(self) -> dict[str, Any]:
        return {
            "count": self.count,
            "minimum": str(self.minimum),
            "maximum": str(self.maximum),
            "average": str(self.average),
            "total": str(self.total),
        }


def calculate_throughput(
    total_tokens: int,
    latency_ms: Any,
) -> Decimal:
    """Calculate tokens processed per second."""
    tokens = max(0, int(total_tokens))
    latency = _to_decimal(latency_ms)

    if tokens == 0 or latency <= 0:
        return Decimal("0")

    return (
        Decimal(tokens)
        / latency
        * Decimal("1000")
    )


def calculate_success_rate(
    successful: int,
    total: int,
) -> Decimal:
    """Calculate the fraction of successful executions."""
    total_count = max(0, int(total))
    successful_count = max(0, int(successful))

    if total_count == 0:
        return Decimal("0")

    return _clamp(
        Decimal(successful_count)
        / Decimal(total_count)
    )


def calculate_error_rate(
    failed: int,
    total: int,
) -> Decimal:
    """Calculate the fraction of failed executions."""
    total_count = max(0, int(total))
    failed_count = max(0, int(failed))

    if total_count == 0:
        return Decimal("0")

    return _clamp(
        Decimal(failed_count)
        / Decimal(total_count)
    )


__all__ = [
    "BenchmarkMetrics",
    "BenchmarkMetricSummary",
    "calculate_throughput",
    "calculate_success_rate",
    "calculate_error_rate",
]

