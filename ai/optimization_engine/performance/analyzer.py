from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any, Iterable, Optional

from .monitor import PerformanceMonitor, PerformanceSnapshot
from .profiler import PerformanceProfile


def _to_decimal(value: Any) -> Decimal:
    try:
        return Decimal(str(value))
    except Exception:
        return Decimal("0")


@dataclass(frozen=True)
class PerformanceAnalysis:
    """Optimization-oriented analysis of runtime performance."""

    sample_count: int
    average_latency_ms: Decimal
    average_time_to_first_token_ms: Decimal
    average_throughput_tokens_per_second: Decimal

    success_rate: Decimal
    error_rate: Decimal

    total_tokens: int

    latency_status: str
    throughput_status: str
    reliability_status: str

    bottleneck: Optional[str]
    recommendation: Optional[str]

    @property
    def healthy(self) -> bool:
        return (
            self.latency_status == "healthy"
            and self.throughput_status == "healthy"
            and self.reliability_status == "healthy"
        )

    def as_dict(self) -> dict[str, Any]:
        return {
            "sample_count": self.sample_count,
            "average_latency_ms": str(
                self.average_latency_ms
            ),
            "average_time_to_first_token_ms": str(
                self.average_time_to_first_token_ms
            ),
            "average_throughput_tokens_per_second": str(
                self.average_throughput_tokens_per_second
            ),
            "success_rate": str(self.success_rate),
            "error_rate": str(self.error_rate),
            "total_tokens": self.total_tokens,
            "latency_status": self.latency_status,
            "throughput_status": self.throughput_status,
            "reliability_status": self.reliability_status,
            "bottleneck": self.bottleneck,
            "recommendation": self.recommendation,
            "healthy": self.healthy,
        }


@dataclass(frozen=True)
class PerformanceThresholds:
    """Thresholds used to classify runtime performance."""

    max_latency_ms: Decimal = Decimal("1000")
    min_throughput_tokens_per_second: Decimal = Decimal("10")
    min_success_rate: Decimal = Decimal("0.95")

    def __post_init__(self) -> None:
        if self.max_latency_ms <= 0:
            raise ValueError(
                "max_latency_ms must be positive"
            )

        if self.min_throughput_tokens_per_second < 0:
            raise ValueError(
                "min_throughput_tokens_per_second "
                "cannot be negative"
            )

        if not (
            Decimal("0")
            <= self.min_success_rate
            <= Decimal("1")
        ):
            raise ValueError(
                "min_success_rate must be between 0 and 1"
            )


class PerformanceAnalyzer:
    """
    Analyzes performance observations and produces signals
    suitable for ModelNow optimization decisions.
    """

    def __init__(
        self,
        thresholds: Optional[PerformanceThresholds] = None,
    ) -> None:
        self.thresholds = (
            thresholds or PerformanceThresholds()
        )

    def analyze_snapshot(
        self,
        snapshot: PerformanceSnapshot,
    ) -> PerformanceAnalysis:
        if not isinstance(snapshot, PerformanceSnapshot):
            raise TypeError(
                "snapshot must be a PerformanceSnapshot"
            )

        latency = _to_decimal(
            snapshot.average_latency_ms
        )
        throughput = _to_decimal(
            snapshot.average_throughput_tokens_per_second
        )
        success_rate = _to_decimal(
            snapshot.success_rate
        )

        latency_status = self._latency_status(latency)
        throughput_status = self._throughput_status(
            throughput
        )
        reliability_status = self._reliability_status(
            success_rate
        )

        bottleneck = self._detect_bottleneck(
            latency_status=latency_status,
            throughput_status=throughput_status,
            reliability_status=reliability_status,
        )

        recommendation = self._recommend(
            bottleneck=bottleneck,
            latency=latency,
            throughput=throughput,
            success_rate=success_rate,
        )

        return PerformanceAnalysis(
            sample_count=snapshot.sample_count,
            average_latency_ms=latency,
            average_time_to_first_token_ms=_to_decimal(
                snapshot.average_time_to_first_token_ms
            ),
            average_throughput_tokens_per_second=throughput,
            success_rate=success_rate,
            error_rate=_to_decimal(
                snapshot.error_rate
            ),
            total_tokens=snapshot.total_tokens,
            latency_status=latency_status,
            throughput_status=throughput_status,
            reliability_status=reliability_status,
            bottleneck=bottleneck,
            recommendation=recommendation,
        )

    def analyze_profiles(
        self,
        profiles: Iterable[PerformanceProfile],
    ) -> PerformanceAnalysis:
        values = list(profiles)

        return self.analyze_snapshot(
            PerformanceSnapshot.from_profiles(values)
        )

    def analyze_monitor(
        self,
        monitor: PerformanceMonitor,
    ) -> PerformanceAnalysis:
        if not isinstance(monitor, PerformanceMonitor):
            raise TypeError(
                "monitor must be a PerformanceMonitor"
            )

        return self.analyze_snapshot(
            monitor.snapshot()
        )

    def compare_models(
        self,
        monitor: PerformanceMonitor,
    ) -> dict[str, PerformanceAnalysis]:
        if not isinstance(monitor, PerformanceMonitor):
            raise TypeError(
                "monitor must be a PerformanceMonitor"
            )

        return {
            model: self.analyze_snapshot(snapshot)
            for model, snapshot
            in monitor.group_by_model().items()
        }

    def compare_providers(
        self,
        monitor: PerformanceMonitor,
    ) -> dict[str, PerformanceAnalysis]:
        if not isinstance(monitor, PerformanceMonitor):
            raise TypeError(
                "monitor must be a PerformanceMonitor"
            )

        return {
            provider: self.analyze_snapshot(snapshot)
            for provider, snapshot
            in monitor.group_by_provider().items()
        }

    def _latency_status(
        self,
        latency: Decimal,
    ) -> str:
        if latency <= self.thresholds.max_latency_ms:
            return "healthy"

        if (
            latency
            <= self.thresholds.max_latency_ms * Decimal("2")
        ):
            return "warning"

        return "critical"

    def _throughput_status(
        self,
        throughput: Decimal,
    ) -> str:
        minimum = (
            self.thresholds
            .min_throughput_tokens_per_second
        )

        if throughput >= minimum:
            return "healthy"

        if throughput >= minimum / Decimal("2"):
            return "warning"

        return "critical"

    def _reliability_status(
        self,
        success_rate: Decimal,
    ) -> str:
        minimum = self.thresholds.min_success_rate

        if success_rate >= minimum:
            return "healthy"

        if success_rate >= minimum - Decimal("0.10"):
            return "warning"

        return "critical"

    @staticmethod
    def _detect_bottleneck(
        *,
        latency_status: str,
        throughput_status: str,
        reliability_status: str,
    ) -> Optional[str]:
        statuses = {
            "latency": latency_status,
            "throughput": throughput_status,
            "reliability": reliability_status,
        }

        critical = [
            name
            for name, status in statuses.items()
            if status == "critical"
        ]

        if critical:
            return critical[0]

        warning = [
            name
            for name, status in statuses.items()
            if status == "warning"
        ]

        if warning:
            return warning[0]

        return None

    @staticmethod
    def _recommend(
        *,
        bottleneck: Optional[str],
        latency: Decimal,
        throughput: Decimal,
        success_rate: Decimal,
    ) -> Optional[str]:
        if bottleneck == "latency":
            return (
                "Consider a lower-latency model, provider, "
                "route, or execution path."
            )

        if bottleneck == "throughput":
            return (
                "Consider a higher-throughput model, "
                "provider, batching strategy, or "
                "streaming execution."
            )

        if bottleneck == "reliability":
            return (
                "Consider a healthier provider, fallback "
                "route, retry policy, or model."
            )

        if bottleneck is None and latency > 0:
            return "Performance is within configured thresholds."

        return None


def create_analyzer(
    thresholds: Optional[PerformanceThresholds] = None,
) -> PerformanceAnalyzer:
    return PerformanceAnalyzer(thresholds=thresholds)


__all__ = [
    "PerformanceAnalysis",
    "PerformanceThresholds",
    "PerformanceAnalyzer",
    "create_analyzer",
]
