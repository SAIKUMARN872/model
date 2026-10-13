from __future__ import annotations

from typing import List

from ..models import OptimizationCandidate
from .exceptions import (
    CostOptimizationCalculationError,
    InvalidCostOptimizationRequestError,
    NoCostOptimizationCandidateError,
    NoFeasibleCostCandidateError,
)
from .interfaces import (
    CostCandidateSelector,
    CostOptimizerInterface,
)
from .models import (
    CostOptimizationRequest,
    CostOptimizationResult,
)
from .utils import (
    calculate_savings,
    calculate_savings_percentage,
    filter_feasible_candidates,
    find_baseline,
)


class LowestCostCandidateSelector(
    CostCandidateSelector
):
    """Select the feasible candidate with the lowest cost."""

    def select(
        self,
        candidates: List[OptimizationCandidate],
        request: CostOptimizationRequest,
    ) -> OptimizationCandidate:
        if not candidates:
            raise NoFeasibleCostCandidateError(
                "No feasible cost optimization candidates available."
            )

        return min(
            candidates,
            key=lambda candidate: (
                candidate.estimated_cost,
                candidate.estimated_latency_ms,
                -candidate.quality_score,
            ),
        )


class CostOptimizer(
    CostOptimizerInterface
):
    """Optimize model/provider selection for minimum cost."""

    def __init__(
        self,
        selector: CostCandidateSelector | None = None,
    ) -> None:
        self.selector = (
            selector
            if selector is not None
            else LowestCostCandidateSelector()
        )

    def optimize(
        self,
        request: CostOptimizationRequest,
    ) -> CostOptimizationResult:
        try:
            self._validate_request(request)

            if not request.candidates:
                raise NoCostOptimizationCandidateError(
                    "No candidates available for cost optimization."
                )

            feasible = filter_feasible_candidates(
                request.candidates,
                request,
            )

            if not feasible:
                raise NoFeasibleCostCandidateError(
                    "No candidates satisfy the cost optimization constraints."
                )

            selected = self.selector.select(
                feasible,
                request,
            )

            baseline = find_baseline(request)

            baseline_cost = (
                baseline.estimated_cost
                if baseline is not None
                else None
            )

            savings = (
                calculate_savings(
                    baseline_cost,
                    selected.estimated_cost,
                )
                if baseline_cost is not None
                else selected.estimated_cost
            )

            savings_percentage = (
                calculate_savings_percentage(
                    baseline_cost,
                    selected.estimated_cost,
                )
                if baseline_cost is not None
                else 0
            )

            optimized = (
                baseline is None
                or (
                    selected.model
                    != baseline.model
                    or selected.provider
                    != baseline.provider
                )
            )

            if baseline is None:
                reason = (
                    "Selected the lowest-cost feasible "
                    "candidate because no baseline route "
                    "was provided."
                )
            elif optimized:
                reason = (
                    "Switched to the lowest-cost feasible "
                    "candidate."
                )
            else:
                reason = (
                    "Current route is already the "
                    "lowest-cost feasible candidate."
                )

            return CostOptimizationResult(
                selected_model=selected.model,
                selected_provider=selected.provider,
                selected_cost=selected.estimated_cost,
                baseline_cost=baseline_cost,
                savings=savings,
                savings_percentage=savings_percentage,
                selected_latency_ms=(
                    selected.estimated_latency_ms
                ),
                selected_quality_score=(
                    selected.quality_score
                ),
                candidates_evaluated=len(
                    request.candidates
                ),
                candidates_feasible=len(feasible),
                optimized=optimized,
                reason=reason,
                request_id=request.request_id,
                metadata=dict(request.metadata),
            )

        except (
            InvalidCostOptimizationRequestError,
            NoCostOptimizationCandidateError,
            NoFeasibleCostCandidateError,
        ):
            raise
        except Exception as exc:
            raise CostOptimizationCalculationError(
                "Cost optimization failed."
            ) from exc

    @staticmethod
    def _validate_request(
        request: CostOptimizationRequest,
    ) -> None:
        if not isinstance(
            request,
            CostOptimizationRequest,
        ):
            raise InvalidCostOptimizationRequestError(
                "request must be a CostOptimizationRequest."
            )


def create_default_cost_optimizer() -> CostOptimizer:
    """Create the default Cost Optimizer."""
    return CostOptimizer()


__all__ = [
    "LowestCostCandidateSelector",
    "CostOptimizer",
    "create_default_cost_optimizer",
]
