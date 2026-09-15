"""
Metrics collection for browser automation.
"""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field
from typing import Any


@dataclass
class MetricValue:
    """Single metric value."""

    name: str

    value: float = 0.0

    labels: dict[str, str] = field(
        default_factory=dict
    )

    updated_at: float = field(
        default_factory=time.time
    )


class MetricsRegistry:
    """
    Thread-safe in-memory metrics registry.

    Supports counters, gauges and timing measurements.
    """

    def __init__(self) -> None:

        self._counters: dict[
            tuple[str, tuple],
            float,
        ] = {}

        self._gauges: dict[
            tuple[str, tuple],
            float,
        ] = {}

        self._timers: dict[
            tuple[str, tuple],
            list[float],
        ] = {}

        self._lock = threading.RLock()

    @staticmethod
    def _key(
        name: str,
        labels: dict[str, str] | None,
    ) -> tuple[str, tuple]:

        normalized = tuple(
            sorted(
                (
                    str(k),
                    str(v),
                )
                for k, v in (
                    labels or {}
                ).items()
            )
        )

        return name, normalized

    def increment(
        self,
        name: str,
        value: float = 1.0,
        labels: dict[str, str] | None = None,
    ) -> float:

        if value < 0:
            raise ValueError(
                "Counter increment cannot be negative."
            )

        key = self._key(
            name,
            labels,
        )

        with self._lock:

            self._counters[key] = (
                self._counters.get(
                    key,
                    0.0,
                )
                + value
            )

            return self._counters[key]

    def set_gauge(
        self,
        name: str,
        value: float,
        labels: dict[str, str] | None = None,
    ) -> float:

        key = self._key(
            name,
            labels,
        )

        with self._lock:

            self._gauges[key] = float(
                value
            )

            return self._gauges[key]

    def observe(
        self,
        name: str,
        value: float,
        labels: dict[str, str] | None = None,
    ) -> None:

        key = self._key(
            name,
            labels,
        )

        with self._lock:

            self._timers.setdefault(
                key,
                [],
            ).append(
                float(value)
            )

    def timer(
        self,
        name: str,
        labels: dict[str, str] | None = None,
    ):
        return MetricTimer(
            self,
            name,
            labels,
        )

    def get_counter(
        self,
        name: str,
        labels: dict[str, str] | None = None,
    ) -> float:

        with self._lock:

            return self._counters.get(
                self._key(
                    name,
                    labels,
                ),
                0.0,
            )

    def get_gauge(
        self,
        name: str,
        labels: dict[str, str] | None = None,
    ) -> float:

        with self._lock:

            return self._gauges.get(
                self._key(
                    name,
                    labels,
                ),
                0.0,
            )

    def snapshot(self) -> dict[str, Any]:

        with self._lock:

            counters = {
                name: value
                for (
                    name,
                    _,
                ), value in self._counters.items()
            }

            gauges = {
                name: value
                for (
                    name,
                    _,
                ), value in self._gauges.items()
            }

            timers = {}

            for (
                name,
                _,
            ), values in self._timers.items():

                if not values:
                    continue

                timers[name] = {
                    "count": len(values),
                    "total": sum(values),
                    "average": (
                        sum(values)
                        / len(values)
                    ),
                    "minimum": min(values),
                    "maximum": max(values),
                }

            return {
                "counters": counters,
                "gauges": gauges,
                "timers": timers,
            }

    def reset(self) -> None:

        with self._lock:

            self._counters.clear()
            self._gauges.clear()
            self._timers.clear()


class MetricTimer:
    """Context manager for measuring execution time."""

    def __init__(
        self,
        registry: MetricsRegistry,
        name: str,
        labels: dict[str, str] | None = None,
    ) -> None:

        self.registry = registry
        self.name = name
        self.labels = labels
        self.started_at: float | None = None

    def __enter__(self):

        self.started_at = time.perf_counter()

        return self

    def __exit__(
        self,
        exc_type,
        exc_value,
        traceback,
    ):

        if self.started_at is not None:

            duration = (
                time.perf_counter()
                - self.started_at
            )

            self.registry.observe(
                self.name,
                duration,
                self.labels,
            )


metrics = MetricsRegistry()