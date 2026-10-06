from __future__ import annotations

from decimal import Decimal
from typing import List

from ..models import OptimizationCandidate
from .exceptions import (
    InvalidLatencyOptimizationRequestError,
    LatencyOptimizationCalculationError,
    NoFeasibleLatencyCandidateError,
    NoLatencyOptimizationCandidateError,
)
from .interfaces import (
    LatencyCandidateSelector,
    LatencyOptimizerInterface,
)
from .models import (
    LatencyOptimizationRequest,
    LatencyOptimizationResult,
)
from .utils import (
    calculate_latency_reduction,
    calculate_latency_reduction_percentage,
    filter_feasible_candidates,
    find_baseline,
)


class LowestLatencyCandidateSelector(
    LatencyCandidateSelector
):
    """Select the feasible candidate with the lowest latency."""

    def select(
        self,
        candidates: List[OptimizationCandidate],
        request: LatencyOptimizationRequest,
    ) -> OptimizationCandidate:
        if not candidates:
            raise NoFeasibleLatencyCandidateError(
                "No feasible latency optimization candidates available."
            )

        return min(
            candidates,
            key=lambda candidate: (
                candidate.estimated_latency_ms,
                candidate.estimated_cost,
                -candidate.quality_score,
            ),
        )


class LatencyOptimizer(
    LatencyOptimizerInterface
):
    """Optimize model/provider selection for minimum latency."""

    def __init__(
        self,
        selector: LatencyCandidateSelector | None = None,
    ) -> None:
        self.selector = (
            selector
            if selector is not None
            else LowestLatencyCandidateSelector()
        )

    def optimize(
        self,
        request: LatencyOptimizationRequest,
    ) -> LatencyOptimizationResult:
        try:
            self._validate_request(request)

            if not request.candidates:
                raise NoLatencyOptimizationCandidateError(
                    "No candidates available for latency optimization."
                )

            feasible = filter_feasible_candidates(
                request.candidates,
                request,
            )

            if not feasible:
                raise NoFeasibleLatencyCandidateError(
                    "No candidates satisfy the latency optimization constraints."
                )

            selected = self.selector.select(
                feasible,
                request,
            )

            baseline = find_baseline(request)

            baseline_latency = (
                baseline.estimated_latency_ms
                if baseline is not None
                else None
            )

            if baseline_latency is not None:
                reduction_ms = calculate_latency_reduction(
                    baseline_latency,
                    selected.estimated_latency_ms,
                )

                reduction_percentage = (
                    calculate_latency_reduction_percentage(
                        baseline_latency,
                        selected.estimated_latency_ms,
                    )
                )
            else:
                reduction_ms = Decimal("0")
                reduction_percentage = Decimal("0")

            optimized = (
                baseline is None
                or (
                    selected.model != baseline.model
                    or selected.provider != baseline.provider
                )
            )

            if baseline is None:
                reason = (
                    "Selected the lowest-latency feasible "
                    "candidate because no baseline route "
                    "was provided."
                )
            elif optimized:
                reason = (
                    "Switched to the lowest-latency feasible "
                    "candidate."
                )
            else:
                reason = (
                    "Current route is already the "
                    "lowest-latency feasible candidate."
                )

            return LatencyOptimizationResult(
                selected_model=selected.model,
                selected_provider=selected.provider,
                selected_latency_ms=(
                    selected.estimated_latency_ms
                ),
                baseline_latency_ms=baseline_latency,
                latency_reduction_ms=reduction_ms,
                latency_reduction_percentage=(
                    reduction_percentage
                ),
                selected_cost=selected.estimated_cost,
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
            InvalidLatencyOptimizationRequestError,
            NoLatencyOptimizationCandidateError,
            NoFeasibleLatencyCandidateError,
        ):
            raise
        except Exception as exc:
            raise LatencyOptimizationCalculationError(
                "Latency optimization failed."
            ) from exc

    @staticmethod
    def _validate_request(
        request: LatencyOptimizationRequest,
    ) -> None:
        if not isinstance(
            request,
            LatencyOptimizationRequest,
        ):
            raise InvalidLatencyOptimizationRequestError(
                "request must be a LatencyOptimizationRequest."
            )


def create_default_latency_optimizer() -> LatencyOptimizer:
    """Create the default latency optimizer."""
    return LatencyOptimizer()


__all__ = [
    "LowestLatencyCandidateSelector",
    "LatencyOptimizer",
    "create_default_latency_optimizer",
]
