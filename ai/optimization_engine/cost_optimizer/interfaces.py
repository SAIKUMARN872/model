from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List

from ..models import OptimizationCandidate
from .models import (
    CostOptimizationRequest,
    CostOptimizationResult,
)


class CostCandidateSelector(ABC):
    """Interface for selecting the lowest-cost feasible candidate."""

    @abstractmethod
    def select(
        self,
        candidates: List[OptimizationCandidate],
        request: CostOptimizationRequest,
    ) -> OptimizationCandidate:
        """Select the best cost-optimized candidate."""
        raise NotImplementedError


class CostOptimizerInterface(ABC):
    """Public interface for the Cost Optimizer."""

    @abstractmethod
    def optimize(
        self,
        request: CostOptimizationRequest,
    ) -> CostOptimizationResult:
        """Perform cost-focused optimization."""
        raise NotImplementedError


__all__ = [
    "CostCandidateSelector",
    "CostOptimizerInterface",
]
