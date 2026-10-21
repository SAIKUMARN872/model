from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from threading import RLock
from time import perf_counter
from typing import Any


class JobStatus(str, Enum):
    SUCCEEDED = "succeeded"
    FAILED = "failed"


@dataclass(frozen=True, slots=True)
class IngestionJobResult:
    job_id: str
    status: JobStatus
    attempts: int
    result: Any = None
    error: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    duration_ms: float = 0.0

    @property
    def succeeded(self) -> bool:
        return self.status is JobStatus.SUCCEEDED


@dataclass(frozen=True, slots=True)
class _Job:
    callback: Callable[[], Any]
    max_attempts: int


class IngestionScheduler:
    """Thread-safe, in-process ingestion job runner with retry support."""

    def __init__(self) -> None:
        self._jobs: dict[str, _Job] = {}
        self._running: set[str] = set()
        self._lock = RLock()

    def register(
        self,
        job_id: str,
        job: Callable[[], Any],
        *,
        max_attempts: int = 1,
    ) -> None:
        if not isinstance(job_id, str) or not job_id.strip():
            raise ValueError("Job ID must be a non-empty string.")
        if not callable(job):
            raise TypeError("Job must be callable.")
        if isinstance(max_attempts, bool) or not isinstance(max_attempts, int):
            raise TypeError("max_attempts must be an integer.")
        if max_attempts < 1:
            raise ValueError("max_attempts must be at least 1.")

        normalized_id = job_id.strip()

        with self._lock:
            if normalized_id in self._jobs:
                raise ValueError(f"Job already registered: {normalized_id}")
            self._jobs[normalized_id] = _Job(job, max_attempts)

    def run(self, job_id: str) -> IngestionJobResult:
        with self._lock:
            if job_id not in self._jobs:
                raise KeyError(f"Unknown ingestion job: {job_id}")
            if job_id in self._running:
                raise RuntimeError(f"Ingestion job is already running: {job_id}")

            job = self._jobs[job_id]
            self._running.add(job_id)

        started_at = datetime.now(timezone.utc)
        timer_start = perf_counter()
        last_error: str | None = None

        try:
            for attempt in range(1, job.max_attempts + 1):
                try:
                    value = job.callback()
                    return IngestionJobResult(
                        job_id=job_id,
                        status=JobStatus.SUCCEEDED,
                        attempts=attempt,
                        result=value,
                        started_at=started_at,
                        completed_at=datetime.now(timezone.utc),
                        duration_ms=(perf_counter() - timer_start) * 1000,
                    )
                except Exception as exc:
                    last_error = f"{type(exc).__name__}: {exc}"

            return IngestionJobResult(
                job_id=job_id,
                status=JobStatus.FAILED,
                attempts=job.max_attempts,
                error=last_error,
                started_at=started_at,
                completed_at=datetime.now(timezone.utc),
                duration_ms=(perf_counter() - timer_start) * 1000,
            )
        finally:
            with self._lock:
                self._running.discard(job_id)

    def list_jobs(self) -> tuple[str, ...]:
        with self._lock:
            return tuple(self._jobs)

    def is_running(self, job_id: str) -> bool:
        with self._lock:
            return job_id in self._running


__all__ = ["JobStatus", "IngestionJobResult", "IngestionScheduler"]
