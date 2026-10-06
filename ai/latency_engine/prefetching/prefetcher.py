from __future__ import annotations

from dataclasses import dataclass, field
from threading import RLock
from time import time
from typing import Callable

from .predictor import PrefetchPredictor, PredictionCandidate
from .strategy import (
    DEFAULT_STRATEGY,
    PrefetchStrategy,
    should_prefetch,
)
from .utils import build_prefetch_key


@dataclass(frozen=True)
class PrefetchRequest:
    request: str
    key: str
    confidence: float
    score: float
    metadata: dict[str, object] = field(
        default_factory=dict
    )


@dataclass(frozen=True)
class PrefetchResult:
    request: str
    key: str
    started: bool
    completed: bool
    success: bool
    error: str | None = None
    metadata: dict[str, object] = field(
        default_factory=dict
    )


@dataclass
class _PrefetchState:
    request: str
    started_at: float
    completed_at: float | None = None
    success: bool = False
    error: str | None = None


PrefetchHandler = Callable[
    [PrefetchRequest],
    object,
]


class Prefetcher:
    def __init__(
        self,
        predictor: PrefetchPredictor | None = None,
        *,
        strategy: PrefetchStrategy = DEFAULT_STRATEGY,
        min_confidence: float = 0.7,
        handler: PrefetchHandler | None = None,
        max_completed: int = 1000,
    ) -> None:
        if max_completed <= 0:
            raise ValueError(
                "max_completed must be positive"
            )

        self.predictor = (
            predictor
            if predictor is not None
            else PrefetchPredictor()
        )

        self.strategy = strategy
        self.min_confidence = min_confidence
        self.handler = handler
        self.max_completed = max_completed

        self._states: dict[str, _PrefetchState] = {}
        self._lock = RLock()

    def register(
        self,
        request: str,
        *,
        timestamp: float | None = None,
    ) -> None:
        self.predictor.record(
            request,
            timestamp=timestamp,
        )

    def register_many(
        self,
        requests: list[str] | tuple[str, ...],
    ) -> None:
        self.predictor.record_many(requests)

    def predicted(
        self,
        *,
        now: float | None = None,
    ) -> PredictionCandidate | None:
        candidates = self.predictor.candidates(
            now=now
        )

        if not candidates:
            return None

        return candidates[0]

    def should_prefetch(
        self,
        candidate: PredictionCandidate | None = None,
    ) -> bool:
        if candidate is None:
            candidate = self.predicted()

        if candidate is None:
            return False

        return should_prefetch(
            self.strategy,
            confidence=candidate.confidence,
            frequency=candidate.frequency,
            recency_score=candidate.recency,
            min_confidence=self.min_confidence,
        )

    def create_request(
        self,
        candidate: PredictionCandidate | None = None,
    ) -> PrefetchRequest | None:
        if candidate is None:
            candidate = self.predicted()

        if candidate is None:
            return None

        if not self.should_prefetch(candidate):
            return None

        return PrefetchRequest(
            request=candidate.request,
            key=candidate.key,
            confidence=candidate.confidence,
            score=candidate.score,
            metadata={
                "frequency": candidate.frequency,
                "recency": candidate.recency,
            },
        )

    def execute(
        self,
        request: PrefetchRequest,
    ) -> PrefetchResult:
        if not isinstance(
            request,
            PrefetchRequest,
        ):
            raise TypeError(
                "request must be PrefetchRequest"
            )

        with self._lock:
            existing = self._states.get(
                request.key
            )

            if (
                existing is not None
                and existing.success
            ):
                return PrefetchResult(
                    request=request.request,
                    key=request.key,
                    started=False,
                    completed=True,
                    success=True,
                    metadata={
                        "cached": True,
                    },
                )

            state = _PrefetchState(
                request=request.request,
                started_at=time(),
            )

            self._states[request.key] = state

        try:
            if self.handler is not None:
                self.handler(request)

            completed_at = time()

            with self._lock:
                state.completed_at = completed_at
                state.success = True
                self._trim_states()

            return PrefetchResult(
                request=request.request,
                key=request.key,
                started=True,
                completed=True,
                success=True,
            )

        except Exception as exc:
            with self._lock:
                state.completed_at = time()
                state.success = False
                state.error = str(exc)
                self._trim_states()

            return PrefetchResult(
                request=request.request,
                key=request.key,
                started=True,
                completed=True,
                success=False,
                error=str(exc),
            )

    def prefetch(
        self,
        *,
        now: float | None = None,
    ) -> PrefetchResult | None:
        request = self.create_request(
            self.predicted(now=now)
        )

        if request is None:
            return None

        return self.execute(request)

    def state(
        self,
        request_or_key: str,
    ) -> _PrefetchState | None:
        key = (
            request_or_key
            if request_or_key.startswith(
                "modelnow:prefetch:"
            )
            else build_prefetch_key(
                request_or_key
            )
        )

        with self._lock:
            state = self._states.get(key)

            if state is None:
                return None

            return _PrefetchState(
                request=state.request,
                started_at=state.started_at,
                completed_at=state.completed_at,
                success=state.success,
                error=state.error,
            )

    def clear(self) -> None:
        with self._lock:
            self._states.clear()

    def _trim_states(self) -> None:
        if len(self._states) <= self.max_completed:
            return

        ordered = sorted(
            self._states.items(),
            key=lambda item: item[1].started_at,
        )

        remove_count = (
            len(self._states)
            - self.max_completed
        )

        for key, _ in ordered[:remove_count]:
            self._states.pop(key, None)

    @property
    def completed_count(self) -> int:
        with self._lock:
            return sum(
                1
                for state in self._states.values()
                if state.completed_at is not None
            )
