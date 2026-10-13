from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List

from ..models import OptimizationCandidate
from .models import (
    LatencyOptimizationRequest,
    LatencyOptimizationResult,
)


class LatencyCandidateSelector(ABC):
    """Interface for selecting the lowest-latency feasible candidate."""

    @abstractmethod
    def select(
        self,
        candidates: List[OptimizationCandidate],
        request: LatencyOptimizationRequest,
    ) -> OptimizationCandidate:
        """Select the best latency-optimized candidate."""
        raise NotImplementedError


class LatencyProfilerInterface(ABC):
    """Interface for collecting latency measurements."""

    @abstractmethod
    def profile(
        self,
        model: str,
        provider: str,
    ):
        """Return latency profile information."""
        raise NotImplementedError


class LatencyPredictorInterface(ABC):
    """Interface for predicting model latency."""

    @abstractmethod
    def predict(
        self,
        model: str,
        provider: str,
    ):
        """Predict latency for a model/provider."""
        raise NotImplementedError


class LatencyOptimizerInterface(ABC):
    """Public interface for the Latency Optimizer."""

    @abstractmethod
    def optimize(
        self,
        request: LatencyOptimizationRequest,
    ) -> LatencyOptimizationResult:
        """Perform latency-focused optimization."""
        raise NotImplementedError


__all__ = [
    "LatencyCandidateSelector",
    "LatencyProfilerInterface",
    "LatencyPredictorInterface",
    "LatencyOptimizerInterface",
]
