"""In-memory metrics for browser automation executions."""

from __future__ import annotations

import threading
from collections import Counter
from dataclasses import dataclass, field
from math import isfinite
from typing import Any


@dataclass
class BrowserAutomationMetrics:
    """Thread-safe counters and duration aggregates."""

    _lock: threading.Lock = field(
        default_factory=threading.Lock, init=False, repr=False
    )
    _counters: Counter[str] = field(
        default_factory=Counter, init=False, repr=False
    )
    _duration_count: Counter[str] = field(
        default_factory=Counter, init=False, repr=False
    )
    _duration_total: Counter[str] = field(
        default_factory=Counter, init=False, repr=False
    )
    _duration_max: dict[str, float] = field(
        default_factory=dict, init=False, repr=False
    )

    def increment(self, name: str, amount: int = 1) -> int:
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Metric name must be non-empty.")
        if isinstance(amount, bool) or not isinstance(amount, int):
            raise TypeError("Counter increment must be an integer.")
        with self._lock:
            self._counters[name] += amount
            return self._counters[name]

    def observe_duration(self, name: str, seconds: float) -> None:
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Metric name must be non-empty.")
        if isinstance(seconds, bool) or not isinstance(seconds, (int, float)):
            raise TypeError("Duration must be numeric.")
        seconds = float(seconds)
        if not isfinite(seconds) or seconds < 0:
            raise ValueError("Duration must be finite and non-negative.")

        with self._lock:
            self._duration_count[name] += 1
            self._duration_total[name] += seconds
            self._duration_max[name] = max(
                self._duration_max.get(name, 0.0), seconds
            )

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            durations = {}
            for name, count in self._duration_count.items():
                total = self._duration_total[name]
                durations[name] = {
                    "count": count,
                    "total_seconds": total,
                    "average_seconds": total / count if count else 0.0,
                    "max_seconds": self._duration_max[name],
                }
            return {
                "counters": dict(self._counters),
                "durations": durations,
            }

    def reset(self) -> None:
        with self._lock:
            self._counters.clear()
            self._duration_count.clear()
            self._duration_total.clear()
            self._duration_max.clear()


# Convenient process-local default. Use a separate instance per worker or
# tenant when metric isolation is required.
default_metrics = BrowserAutomationMetrics()
