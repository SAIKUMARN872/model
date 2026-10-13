from __future__ import annotations

import time
from dataclasses import dataclass


@dataclass
class InferenceProfiler:
    """Measure inference execution timing."""

    started_at: float | None = None
    completed_at: float | None = None

    def start(self) -> None:
        self.started_at = time.perf_counter()
        self.completed_at = None

    def stop(self) -> float:
        if self.started_at is None:
            raise RuntimeError(
                "Profiler has not been started."
            )

        self.completed_at = time.perf_counter()

        return (
            self.completed_at
            - self.started_at
        ) * 1000.0

    @property
    def elapsed_ms(self) -> float:
        if self.started_at is None:
            return 0.0

        end = (
            self.completed_at
            if self.completed_at is not None
            else time.perf_counter()
        )

        return (
            end - self.started_at
        ) * 1000.0


__all__ = ["InferenceProfiler"]
