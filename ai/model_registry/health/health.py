from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Iterable

from ..models import ModelRecord
from .heartbeat import Heartbeat
from .status import HealthCheckResult, HealthStatus
from .utils import (
    average_latency,
    status_from_failures,
)


@dataclass
class ModelHealth:
    """
    Runtime health state for one canonical model.
    """

    qualified_id: str
    status: HealthStatus = HealthStatus.UNKNOWN
    latency_ms: float | None = None
    consecutive_failures: int = 0
    last_checked: datetime | None = None
    message: str = ""


class HealthManager:
    """
    In-memory health manager for ModelNow models.

    This layer records health observations. It does not make
    external provider calls.
    """

    def __init__(self) -> None:
        self._health: dict[str, ModelHealth] = {}
        self._heartbeats: dict[str, Heartbeat] = {}

    def register(
        self,
        model: ModelRecord,
    ) -> ModelHealth:
        if not isinstance(model, ModelRecord):
            raise TypeError(
                "model must be a ModelRecord"
            )

        key = model.qualified_id.lower()

        if key in self._health:
            raise ValueError(
                f"Health already exists: "
                f"{model.qualified_id}"
            )

        health = ModelHealth(
            qualified_id=model.qualified_id
        )

        self._health[key] = health
        self._heartbeats[key] = Heartbeat(
            model.qualified_id
        )

        return health

    def upsert(
        self,
        model: ModelRecord,
    ) -> ModelHealth:
        if not isinstance(model, ModelRecord):
            raise TypeError(
                "model must be a ModelRecord"
            )

        key = model.qualified_id.lower()

        if key not in self._health:
            self._health[key] = ModelHealth(
                qualified_id=model.qualified_id
            )
            self._heartbeats[key] = Heartbeat(
                model.qualified_id
            )

        return self._health[key]

    def get(
        self,
        qualified_id: str,
    ) -> ModelHealth | None:
        return self._health.get(
            qualified_id.strip().lower()
        )

    def record_success(
        self,
        qualified_id: str,
        *,
        latency_ms: float | None = None,
        message: str = "",
        checked_at: datetime | None = None,
    ) -> ModelHealth:
        key = qualified_id.strip().lower()

        health = self._require(key)
        heartbeat = self._heartbeats[key]

        if latency_ms is not None and latency_ms < 0:
            raise ValueError(
                "latency_ms cannot be negative"
            )

        heartbeat.mark_alive(checked_at)

        health.status = HealthStatus.HEALTHY
        health.latency_ms = latency_ms
        health.consecutive_failures = 0
        health.last_checked = heartbeat.last_seen
        health.message = message

        return health

    def record_failure(
        self,
        qualified_id: str,
        *,
        latency_ms: float | None = None,
        message: str = "",
        checked_at: datetime | None = None,
    ) -> ModelHealth:
        key = qualified_id.strip().lower()

        health = self._require(key)
        heartbeat = self._heartbeats[key]

        if latency_ms is not None and latency_ms < 0:
            raise ValueError(
                "latency_ms cannot be negative"
            )

        heartbeat.mark_failure()

        health.consecutive_failures = (
            heartbeat.consecutive_failures
        )

        health.status = status_from_failures(
            health.consecutive_failures
        )

        health.latency_ms = latency_ms
        health.last_checked = (
            checked_at or datetime.now().astimezone()
        )
        health.message = message

        return health

    def check(
        self,
        qualified_id: str,
    ) -> HealthCheckResult:
        health = self._require(
            qualified_id.strip().lower()
        )

        return HealthCheckResult(
            health.status,
            message=health.message,
            latency_ms=health.latency_ms,
        )

    def list_all(self) -> list[ModelHealth]:
        return list(self._health.values())

    def healthy_models(self) -> list[ModelHealth]:
        return [
            item
            for item in self._health.values()
            if item.status == HealthStatus.HEALTHY
        ]

    def available_models(self) -> list[ModelHealth]:
        return [
            item
            for item in self._health.values()
            if item.status
            in {
                HealthStatus.HEALTHY,
                HealthStatus.DEGRADED,
            }
        ]

    def count(self) -> int:
        return len(self._health)

    def clear(self) -> None:
        self._health.clear()
        self._heartbeats.clear()

    def average_latency(
        self,
        qualified_ids: Iterable[str] | None = None,
    ) -> float | None:
        if qualified_ids is None:
            values = [
                item.latency_ms
                for item in self._health.values()
                if item.latency_ms is not None
            ]
        else:
            values = [
                self._require(
                    value.strip().lower()
                ).latency_ms
                for value in qualified_ids
            ]

            values = [
                value
                for value in values
                if value is not None
            ]

        return average_latency(values)

    def _require(
        self,
        key: str,
    ) -> ModelHealth:
        health = self._health.get(key)

        if health is None:
            raise KeyError(
                f"Unknown model health: {key}"
            )

        return health


__all__ = [
    "ModelHealth",
    "HealthManager",
]
