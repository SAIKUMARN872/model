"""Thread-safe execution metrics for tool health monitoring."""

from __future__ import annotations

from threading import RLock
from typing import Any

from ..executor.result import ToolExecutionResult


class ToolHealthMonitor:
    """Collect execution counts and latest outcomes by tool and version."""

    def __init__(self) -> None:
        self._lock = RLock()
        self._metrics: dict[tuple[str, str | None], dict[str, Any]] = {}

    def record_result(self, result: ToolExecutionResult) -> None:
        if not isinstance(result, ToolExecutionResult):
            raise TypeError("result must be a ToolExecutionResult.")

        key = (result.tool_name, result.version)
        with self._lock:
            metrics = self._metrics.setdefault(
                key,
                {
                    "execution_count": 0,
                    "success_count": 0,
                    "failure_count": 0,
                    "last_execution_status": None,
                    "last_error": None,
                    "last_duration_seconds": None,
                },
            )
            metrics["execution_count"] += 1

            if result.success:
                metrics["success_count"] += 1
            else:
                metrics["failure_count"] += 1

            metrics["last_execution_status"] = result.status.value
            metrics["last_error"] = result.error
            metrics["last_duration_seconds"] = result.duration_seconds

    def get_metrics(
        self,
        name: str,
        version: str | None = None,
    ) -> dict[str, Any]:
        """Return a defensive copy of metrics for one tool version."""
        with self._lock:
            metrics = self._metrics.get((name, version))
            if metrics is None:
                return {
                    "execution_count": 0,
                    "success_count": 0,
                    "failure_count": 0,
                    "last_execution_status": None,
                    "last_error": None,
                    "last_duration_seconds": None,
                }
            return dict(metrics)

    def snapshot(self) -> dict[tuple[str, str | None], dict[str, Any]]:
        """Return a defensive snapshot of all execution metrics."""
        with self._lock:
            return {
                key: dict(value)
                for key, value in self._metrics.items()
            }
