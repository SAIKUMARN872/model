from __future__ import annotations

from dataclasses import dataclass, field
from threading import Lock
from typing import Iterable, Mapping

from .strategy import LoadBalancingStrategy
from .weights import (
    calculate_weighted_score,
    normalize_weights,
    validate_weight,
)


@dataclass(frozen=True)
class LoadTarget:
    """Runtime state for a routable model/provider target."""

    target_id: str
    weight: float = 1.0
    active_requests: int = 0
    latency_ms: float = 0.0
    healthy: bool = True
    capacity: int = 100
    metadata: dict[str, object] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.target_id.strip():
            raise ValueError("target_id must be non-empty")

        if self.active_requests < 0:
            raise ValueError("active_requests cannot be negative")

        if self.capacity <= 0:
            raise ValueError("capacity must be greater than zero")

        if self.latency_ms < 0:
            raise ValueError("latency_ms cannot be negative")

        validate_weight(self.weight)


class LoadBalancer:
    """Deterministic, state-aware load balancer for ModelNow routing."""

    def __init__(
        self,
        strategy: LoadBalancingStrategy = LoadBalancingStrategy.ROUND_ROBIN,
    ) -> None:
        self._strategy = strategy
        self._targets: dict[str, LoadTarget] = {}
        self._round_robin_index = 0
        self._lock = Lock()

    @property
    def strategy(self) -> LoadBalancingStrategy:
        return self._strategy

    def set_strategy(self, strategy: LoadBalancingStrategy) -> None:
        if not isinstance(strategy, LoadBalancingStrategy):
            strategy = LoadBalancingStrategy(strategy)

        with self._lock:
            self._strategy = strategy

    def register(self, target: LoadTarget) -> None:
        if not isinstance(target, LoadTarget):
            raise TypeError("target must be a LoadTarget")

        with self._lock:
            self._targets[target.target_id] = target

    def register_many(self, targets: Iterable[LoadTarget]) -> None:
        for target in targets:
            self.register(target)

    def remove(self, target_id: str) -> bool:
        with self._lock:
            return self._targets.pop(target_id, None) is not None

    def get_target(self, target_id: str) -> LoadTarget | None:
        with self._lock:
            return self._targets.get(target_id)

    def targets(self) -> tuple[LoadTarget, ...]:
        with self._lock:
            return tuple(self._targets.values())

    def update_load(
        self,
        target_id: str,
        *,
        active_requests: int | None = None,
        latency_ms: float | None = None,
        healthy: bool | None = None,
    ) -> LoadTarget:
        with self._lock:
            target = self._targets.get(target_id)

            if target is None:
                raise KeyError(f"unknown target: {target_id}")

            updated = LoadTarget(
                target_id=target.target_id,
                weight=target.weight,
                active_requests=(
                    target.active_requests
                    if active_requests is None
                    else active_requests
                ),
                latency_ms=(
                    target.latency_ms
                    if latency_ms is None
                    else latency_ms
                ),
                healthy=(
                    target.healthy
                    if healthy is None
                    else healthy
                ),
                capacity=target.capacity,
                metadata=target.metadata,
            )

            self._targets[target_id] = updated
            return updated

    def available_targets(
        self,
        target_ids: Iterable[str] | None = None,
    ) -> tuple[LoadTarget, ...]:
        with self._lock:
            if target_ids is None:
                candidates = tuple(self._targets.values())
            else:
                candidates = tuple(
                    self._targets[target_id]
                    for target_id in target_ids
                    if target_id in self._targets
                )

        return tuple(
            target
            for target in candidates
            if target.healthy
            and target.active_requests < target.capacity
        )

    def select(
        self,
        target_ids: Iterable[str] | None = None,
    ) -> LoadTarget:
        candidates = self.available_targets(target_ids)

        if not candidates:
            raise LookupError("no healthy target is available")

        if self._strategy == LoadBalancingStrategy.ROUND_ROBIN:
            return self._select_round_robin(candidates)

        if self._strategy == LoadBalancingStrategy.WEIGHTED:
            return self._select_weighted(candidates)

        if self._strategy == LoadBalancingStrategy.LEAST_LOADED:
            return min(
                candidates,
                key=lambda target: (
                    target.active_requests / target.capacity,
                    target.active_requests,
                    target.target_id,
                ),
            )

        if self._strategy == LoadBalancingStrategy.LATENCY_AWARE:
            return min(
                candidates,
                key=lambda target: (
                    target.latency_ms,
                    target.active_requests / target.capacity,
                    target.target_id,
                ),
            )

        if self._strategy == LoadBalancingStrategy.HEALTH_AWARE:
            return max(
                candidates,
                key=lambda target: (
                    target.healthy,
                    -target.active_requests / target.capacity,
                    -target.latency_ms,
                    target.weight,
                    target.target_id,
                ),
            )

        raise ValueError(
            f"unsupported strategy: {self._strategy}"
        )

    def _select_round_robin(
        self,
        candidates: tuple[LoadTarget, ...],
    ) -> LoadTarget:
        with self._lock:
            ordered = sorted(
                candidates,
                key=lambda target: target.target_id,
            )

            target = ordered[
                self._round_robin_index % len(ordered)
            ]

            self._round_robin_index += 1
            return target

    @staticmethod
    def _select_weighted(
        candidates: tuple[LoadTarget, ...],
    ) -> LoadTarget:
        weights = normalize_weights(
            {
                target.target_id: target.weight
                for target in candidates
            }
        )

        return max(
            candidates,
            key=lambda target: (
                calculate_weighted_score(
                    weights[target.target_id],
                    target.active_requests / target.capacity,
                    target.latency_ms,
                ),
                target.target_id,
            ),
        )


__all__ = [
    "LoadBalancer",
    "LoadTarget",
]
