from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any, Iterable, Mapping

from .utils import (
    calculate_average,
    calculate_error_rate,
    calculate_success_rate,
    calculate_throughput,
    to_decimal,
    validate_non_negative,
)


def _clamp(
    value: Decimal,
    minimum: Decimal = Decimal("0"),
    maximum: Decimal = Decimal("1"),
) -> Decimal:
    return max(
        minimum,
        min(value, maximum),
    )


@dataclass(frozen=True)
class BenchmarkMetrics:
    latency_ms: Decimal = Decimal("0")
    time_to_first_token_ms: Decimal = Decimal("0")
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    throughput_tokens_per_second: Decimal = Decimal("0")
    cost: Decimal = Decimal("0")
    quality: Decimal = Decimal("0")
    success: bool = True
    error_type: str | None = None
    error_message: str | None = None

    def __post_init__(self) -> None:
        latency = validate_non_negative(
            self.latency_ms,
            field_name="latency_ms",
        )

        ttft = validate_non_negative(
            self.time_to_first_token_ms,
            field_name="time_to_first_token_ms",
        )

        input_tokens = int(self.input_tokens)
        output_tokens = int(self.output_tokens)
        total_tokens = int(self.total_tokens)

        if input_tokens < 0:
            raise ValueError(
                "input_tokens cannot be negative"
            )

        if output_tokens < 0:
            raise ValueError(
                "output_tokens cannot be negative"
            )

        if total_tokens < 0:
            raise ValueError(
                "total_tokens cannot be negative"
            )

        if total_tokens == 0:
            total_tokens = (
                input_tokens + output_tokens
            )

        throughput = validate_non_negative(
            self.throughput_tokens_per_second,
            field_name=(
                "throughput_tokens_per_second"
            ),
        )

        if throughput == 0 and latency > 0:
            throughput = calculate_throughput(
                total_tokens,
                latency,
            )

        cost = validate_non_negative(
            self.cost,
            field_name="cost",
        )

        quality = _clamp(
            to_decimal(self.quality)
        )

        object.__setattr__(
            self,
            "latency_ms",
            latency,
        )
        object.__setattr__(
            self,
            "time_to_first_token_ms",
            ttft,
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
        object.__setattr__(
            self,
            "throughput_tokens_per_second",
            throughput,
        )
        object.__setattr__(
            self,
            "cost",
            cost,
        )
        object.__setattr__(
            self,
            "quality",
            quality,
        )

    @property
    def failed(self) -> bool:
        return not self.success

    def as_dict(self) -> dict[str, Any]:
        return {
            "latency_ms": str(self.latency_ms),
            "time_to_first_token_ms": str(
                self.time_to_first_token_ms
            ),
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "total_tokens": self.total_tokens,
            "throughput_tokens_per_second": str(
                self.throughput_tokens_per_second
            ),
            "cost": str(self.cost),
            "quality": str(self.quality),
            "success": self.success,
            "error_type": self.error_type,
            "error_message": self.error_message,
        }


@dataclass(frozen=True)
class BenchmarkMetricSummary:
    sample_count: int
    successful_count: int
    failed_count: int
    average_latency_ms: Decimal
    average_time_to_first_token_ms: Decimal
    average_throughput_tokens_per_second: Decimal
    average_cost: Decimal
    average_quality: Decimal
    total_input_tokens: int
    total_output_tokens: int
    total_tokens: int
    success_rate: Decimal
    error_rate: Decimal

    @property
    def healthy(self) -> bool:
        return (
            self.sample_count > 0
            and self.success_rate > 0
        )

    def as_dict(self) -> dict[str, Any]:
        return {
            "sample_count": self.sample_count,
            "successful_count": self.successful_count,
            "failed_count": self.failed_count,
            "average_latency_ms": str(
                self.average_latency_ms
            ),
            "average_time_to_first_token_ms": str(
                self.average_time_to_first_token_ms
            ),
            "average_throughput_tokens_per_second": str(
                self.average_throughput_tokens_per_second
            ),
            "average_cost": str(
                self.average_cost
            ),
            "average_quality": str(
                self.average_quality
            ),
            "total_input_tokens": (
                self.total_input_tokens
            ),
            "total_output_tokens": (
                self.total_output_tokens
            ),
            "total_tokens": self.total_tokens,
            "success_rate": str(
                self.success_rate
            ),
            "error_rate": str(
                self.error_rate
            ),
            "healthy": self.healthy,
        }


def summarize_metrics(
    metrics: Iterable[BenchmarkMetrics],
) -> BenchmarkMetricSummary:
    items = list(metrics)

    if not items:
        return BenchmarkMetricSummary(
            sample_count=0,
            successful_count=0,
            failed_count=0,
            average_latency_ms=Decimal("0"),
            average_time_to_first_token_ms=Decimal("0"),
            average_throughput_tokens_per_second=(
                Decimal("0")
            ),
            average_cost=Decimal("0"),
            average_quality=Decimal("0"),
            total_input_tokens=0,
            total_output_tokens=0,
            total_tokens=0,
            success_rate=Decimal("0"),
            error_rate=Decimal("0"),
        )

    successful_count = sum(
        1 for item in items if item.success
    )

    failed_count = (
        len(items) - successful_count
    )

    total_input_tokens = sum(
        item.input_tokens
        for item in items
    )

    total_output_tokens = sum(
        item.output_tokens
        for item in items
    )

    total_tokens = sum(
        item.total_tokens
        for item in items
    )

    return BenchmarkMetricSummary(
        sample_count=len(items),
        successful_count=successful_count,
        failed_count=failed_count,
        average_latency_ms=calculate_average(
            [item.latency_ms for item in items]
        ),
        average_time_to_first_token_ms=(
            calculate_average(
                [
                    item.time_to_first_token_ms
                    for item in items
                ]
            )
        ),
        average_throughput_tokens_per_second=(
            calculate_average(
                [
                    item.throughput_tokens_per_second
                    for item in items
                ]
            )
        ),
        average_cost=calculate_average(
            [item.cost for item in items]
        ),
        average_quality=calculate_average(
            [item.quality for item in items]
        ),
        total_input_tokens=total_input_tokens,
        total_output_tokens=total_output_tokens,
        total_tokens=total_tokens,
        success_rate=calculate_success_rate(
            successful_count,
            len(items),
        ),
        error_rate=calculate_error_rate(
            failed_count,
            len(items),
        ),
    )


def calculate_success_rate_from_metrics(
    metrics: Iterable[BenchmarkMetrics],
) -> Decimal:
    items = list(metrics)

    return calculate_success_rate(
        sum(1 for item in items if item.success),
        len(items),
    )


def calculate_error_rate_from_metrics(
    metrics: Iterable[BenchmarkMetrics],
) -> Decimal:
    items = list(metrics)

    return calculate_error_rate(
        sum(1 for item in items if not item.success),
        len(items),
    )


def metrics_from_mappings(
    values: Iterable[Mapping[str, Any]],
) -> list[BenchmarkMetrics]:
    return [
        BenchmarkMetrics(
            latency_ms=value.get(
                "latency_ms",
                0,
            ),
            time_to_first_token_ms=value.get(
                "time_to_first_token_ms",
                0,
            ),
            input_tokens=value.get(
                "input_tokens",
                0,
            ),
            output_tokens=value.get(
                "output_tokens",
                0,
            ),
            total_tokens=value.get(
                "total_tokens",
                0,
            ),
            throughput_tokens_per_second=value.get(
                "throughput_tokens_per_second",
                0,
            ),
            cost=value.get(
                "cost",
                0,
            ),
            quality=value.get(
                "quality",
                0,
            ),
            success=value.get(
                "success",
                True,
            ),
            error_type=value.get(
                "error_type"
            ),
            error_message=value.get(
                "error_message"
            ),
        )
        for value in values
    ]


__all__ = [
    "BenchmarkMetrics",
    "BenchmarkMetricSummary",
    "summarize_metrics",
    "calculate_success_rate_from_metrics",
    "calculate_error_rate_from_metrics",
    "metrics_from_mappings",
]
