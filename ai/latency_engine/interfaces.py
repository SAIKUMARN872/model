from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Iterable

from .models import (
    LatencyDegradation,
    LatencyObservation,
    LatencyPrediction,
    LatencyStatistics,
    SLAResult,
)


class LatencyStore(ABC):
    """Storage contract for latency observations."""

    @abstractmethod
    def add(self, observation: LatencyObservation) -> LatencyObservation:
        raise NotImplementedError

    @abstractmethod
    def add_many(
        self,
        observations: Iterable[LatencyObservation],
    ) -> int:
        raise NotImplementedError

    @abstractmethod
    def records(self) -> list[LatencyObservation]:
        raise NotImplementedError

    @abstractmethod
    def count(self) -> int:
        raise NotImplementedError

    @abstractmethod
    def clear(self) -> int:
        raise NotImplementedError


class LatencyAnalyzer(ABC):
    """Contract for calculating latency statistics."""

    @abstractmethod
    def statistics(
        self,
        observations: Iterable[LatencyObservation],
    ) -> LatencyStatistics:
        raise NotImplementedError


class LatencyPredictor(ABC):
    """Contract for predicting future model latency."""

    @abstractmethod
    def predict(
        self,
        model_id: str,
        provider: str,
        observations: Iterable[LatencyObservation],
    ) -> LatencyPrediction:
        raise NotImplementedError


class SLAChecker(ABC):
    """Contract for latency SLA evaluation."""

    @abstractmethod
    def check(
        self,
        actual_latency_ms: float,
        target_latency_ms: float,
    ) -> SLAResult:
        raise NotImplementedError


class DegradationDetector(ABC):
    """Contract for detecting latency degradation."""

    @abstractmethod
    def detect(
        self,
        model_id: str,
        provider: str,
        baseline_latency_ms: float,
        current_latency_ms: float,
        threshold_percent: float,
    ) -> LatencyDegradation:
        raise NotImplementedError


__all__ = [
    "LatencyStore",
    "LatencyAnalyzer",
    "LatencyPredictor",
    "SLAChecker",
    "DegradationDetector",
]
