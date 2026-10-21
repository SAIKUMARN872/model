from __future__ import annotations

from enum import Enum


class LatencyMetric(str, Enum):
    """Supported latency measurements."""

    TOTAL = "total"
    TTFT = "ttft"
    QUEUE = "queue"
    GENERATION = "generation"


class LatencyPercentile(str, Enum):
    """Supported latency percentiles."""

    P50 = "p50"
    P95 = "p95"
    P99 = "p99"


class LatencyStatus(str, Enum):
    """Latency health status."""

    HEALTHY = "healthy"
    WARNING = "warning"
    DEGRADED = "degraded"
    UNKNOWN = "unknown"


DEFAULT_DEGRADATION_THRESHOLD_PERCENT = 25.0
DEFAULT_SLA_TARGET_MS = 1000.0
DEFAULT_HISTORY_LIMIT = 10_000
DEFAULT_MIN_SAMPLES = 1

PERCENTILE_P50 = 50.0
PERCENTILE_P95 = 95.0
PERCENTILE_P99 = 99.0


__all__ = [
    "LatencyMetric",
    "LatencyPercentile",
    "LatencyStatus",
    "DEFAULT_DEGRADATION_THRESHOLD_PERCENT",
    "DEFAULT_SLA_TARGET_MS",
    "DEFAULT_HISTORY_LIMIT",
    "DEFAULT_MIN_SAMPLES",
    "PERCENTILE_P50",
    "PERCENTILE_P95",
    "PERCENTILE_P99",
]
