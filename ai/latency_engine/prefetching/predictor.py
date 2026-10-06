from __future__ import annotations

from dataclasses import dataclass, field
from time import time

from .utils import (
    build_prefetch_key,
    clamp_confidence,
    normalize_key,
    recency_score,
    weighted_score,
)


@dataclass(frozen=True)
class PredictionCandidate:
    request: str
    confidence: float
    frequency: int
    recency: float
    score: float
    key: str
    metadata: dict[str, object] = field(
        default_factory=dict
    )


@dataclass(frozen=True)
class PredictionResult:
    request: str
    confidence: float
    candidates: tuple[PredictionCandidate, ...] = ()
    metadata: dict[str, object] = field(
        default_factory=dict
    )


@dataclass
class _HistoryEntry:
    request: str
    timestamp: float


class PrefetchPredictor:
    def __init__(
        self,
        *,
        max_history: int = 1000,
        min_confidence: float = 0.5,
        max_candidates: int = 5,
        half_life_seconds: float = 300.0,
    ) -> None:
        if max_history <= 0:
            raise ValueError(
                "max_history must be positive"
            )

        if max_candidates <= 0:
            raise ValueError(
                "max_candidates must be positive"
            )

        if half_life_seconds <= 0.0:
            raise ValueError(
                "half_life_seconds must be positive"
            )

        self.max_history = max_history
        self.min_confidence = clamp_confidence(
            min_confidence
        )
        self.max_candidates = max_candidates
        self.half_life_seconds = half_life_seconds

        self._history: list[_HistoryEntry] = []

    def record(
        self,
        request: str,
        *,
        timestamp: float | None = None,
    ) -> None:
        normalized = normalize_key(request)

        entry = _HistoryEntry(
            request=normalized,
            timestamp=(
                time()
                if timestamp is None
                else float(timestamp)
            ),
        )

        self._history.append(entry)

        if len(self._history) > self.max_history:
            self._history = self._history[
                -self.max_history :
            ]

    def record_many(
        self,
        requests: list[str] | tuple[str, ...],
    ) -> None:
        for request in requests:
            self.record(request)

    def history(self) -> tuple[str, ...]:
        return tuple(
            entry.request
            for entry in self._history
        )

    def clear(self) -> None:
        self._history.clear()

    @property
    def samples(self) -> int:
        return len(self._history)

    def candidates(
        self,
        *,
        now: float | None = None,
    ) -> tuple[PredictionCandidate, ...]:
        if not self._history:
            return ()

        current_time = (
            time()
            if now is None
            else float(now)
        )

        grouped: dict[str, list[_HistoryEntry]] = {}

        for entry in self._history:
            grouped.setdefault(
                entry.request,
                [],
            ).append(entry)

        total = len(self._history)
        candidates: list[PredictionCandidate] = []

        for request, entries in grouped.items():
            frequency = len(entries)

            latest = max(
                entries,
                key=lambda item: item.timestamp,
            )

            age = max(
                0.0,
                current_time - latest.timestamp,
            )

            recency = recency_score(
                age_seconds=age,
                half_life_seconds=self.half_life_seconds,
            )

            frequency_score = min(
                1.0,
                frequency / max(1, total),
            )

            confidence = clamp_confidence(
                frequency_score * 0.7
                + recency * 0.3
            )

            score = weighted_score(
                confidence=confidence,
                frequency=frequency_score,
                recency=recency,
            )

            candidates.append(
                PredictionCandidate(
                    request=request,
                    confidence=confidence,
                    frequency=frequency,
                    recency=recency,
                    score=score,
                    key=build_prefetch_key(request),
                    metadata={
                        "total_history": total,
                        "latest_timestamp": latest.timestamp,
                    },
                )
            )

        candidates.sort(
            key=lambda item: (
                item.score,
                item.confidence,
                item.frequency,
                item.recency,
            ),
            reverse=True,
        )

        return tuple(
            candidates[: self.max_candidates]
        )

    def predict(
        self,
        *,
        now: float | None = None,
    ) -> PredictionResult | None:
        candidates = self.candidates(now=now)

        if not candidates:
            return None

        top = candidates[0]

        if top.confidence < self.min_confidence:
            return None

        return PredictionResult(
            request=top.request,
            confidence=top.confidence,
            candidates=candidates,
            metadata={
                "history_samples": self.samples,
                "candidate_count": len(candidates),
            },
        )

    def predict_next(
        self,
        *,
        now: float | None = None,
    ) -> str | None:
        result = self.predict(now=now)

        if result is None:
            return None

        return result.request
