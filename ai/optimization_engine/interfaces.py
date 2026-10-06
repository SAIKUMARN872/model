from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List, Optional

from .models import (
    OptimizationCandidate,
    OptimizationDecision,
    OptimizationRequest,
    OptimizationResult,
    OptimizationScore,
)


class CandidateScorer(ABC):
    """Interface for scoring optimization candidates."""

    @abstractmethod
    def score(
        self,
        request: OptimizationRequest,
        candidate: OptimizationCandidate,
    ) -> OptimizationScore:
        """Calculate the optimization score for a candidate."""
        raise NotImplementedError


class ConstraintEvaluator(ABC):
    """Interface for evaluating optimization constraints."""

    @abstractmethod
    def is_feasible(
        self,
        request: OptimizationRequest,
        candidate: OptimizationCandidate,
    ) -> bool:
        """Return whether a candidate satisfies all constraints."""
        raise NotImplementedError


class OptimizationStrategy(ABC):
    """Interface for optimization strategies."""

    @abstractmethod
    def optimize(
        self,
        request: OptimizationRequest,
        candidates: List[OptimizationCandidate],
    ) -> OptimizationDecision:
        """Select the best optimization decision."""
        raise NotImplementedError


class OptimizationHistoryStore(ABC):
    """Interface for storing optimization results."""

    @abstractmethod
    def record(
        self,
        result: OptimizationResult,
    ) -> None:
        """Record an optimization result."""
        raise NotImplementedError

    @abstractmethod
    def list(
        self,
        request_id: Optional[str] = None,
    ) -> List[OptimizationResult]:
        """Return stored optimization results."""
        raise NotImplementedError


class OptimizationEngineInterface(ABC):
    """Public interface for the Optimization Engine."""

    @abstractmethod
    def optimize(
        self,
        request: OptimizationRequest,
    ) -> OptimizationResult:
        """Optimize a routing request."""
        raise NotImplementedError

    @abstractmethod
    def evaluate(
        self,
        request: OptimizationRequest,
        candidate: OptimizationCandidate,
    ) -> OptimizationScore:
        """Evaluate one candidate."""
        raise NotImplementedError


__all__ = [
    "CandidateScorer",
    "ConstraintEvaluator",
    "OptimizationStrategy",
    "OptimizationHistoryStore",
    "OptimizationEngineInterface",
]
