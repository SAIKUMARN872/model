from __future__ import annotations

import unittest
from decimal import Decimal

from ..models import OptimizationCandidate

from .accelerator import LatencyAccelerator
from .exceptions import (
    NoFeasibleLatencyCandidateError,
    NoLatencyOptimizationCandidateError,
)
from .models import LatencyOptimizationRequest
from .optimizer import (
    LatencyOptimizer,
    LowestLatencyCandidateSelector,
)
from .predictor import LatencyPredictor
from .profiler import LatencyProfiler
from .utils import (
    calculate_latency_reduction,
    calculate_latency_reduction_percentage,
    filter_feasible_candidates,
)


class LatencyOptimizerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.candidates = [
            OptimizationCandidate(
                model="slow-model",
                provider="provider-a",
                estimated_cost=Decimal("0.001"),
                estimated_latency_ms=Decimal("800"),
                quality_score=Decimal("0.90"),
            ),
            OptimizationCandidate(
                model="fast-model",
                provider="provider-b",
                estimated_cost=Decimal("0.003"),
                estimated_latency_ms=Decimal("200"),
                quality_score=Decimal("0.92"),
            ),
            OptimizationCandidate(
                model="balanced-model",
                provider="provider-c",
                estimated_cost=Decimal("0.002"),
                estimated_latency_ms=Decimal("400"),
                quality_score=Decimal("0.95"),
            ),
        ]

    def test_lowest_latency_selection(self) -> None:
        request = LatencyOptimizationRequest(
            candidates=self.candidates,
        )

        optimizer = LatencyOptimizer()

        result = optimizer.optimize(request)

        self.assertEqual(
            result.selected_model,
            "fast-model",
        )
        self.assertEqual(
            result.selected_provider,
            "provider-b",
        )
        self.assertEqual(
            result.selected_latency_ms,
            Decimal("200"),
        )

    def test_baseline_reduction(self) -> None:
        request = LatencyOptimizationRequest(
            candidates=self.candidates,
            current_model="slow-model",
            current_provider="provider-a",
        )

        result = LatencyOptimizer().optimize(request)

        self.assertEqual(
            result.baseline_latency_ms,
            Decimal("800"),
        )
        self.assertEqual(
            result.latency_reduction_ms,
            Decimal("600"),
        )
        self.assertEqual(
            result.latency_reduction_percentage,
            Decimal("75"),
        )
        self.assertTrue(result.optimized)

    def test_keep_current_route(self) -> None:
        request = LatencyOptimizationRequest(
            candidates=self.candidates,
            current_model="fast-model",
            current_provider="provider-b",
        )

        result = LatencyOptimizer().optimize(request)

        self.assertEqual(
            result.selected_model,
            "fast-model",
        )
        self.assertFalse(result.optimized)
        self.assertEqual(
            result.latency_reduction_ms,
            Decimal("0"),
        )

    def test_latency_constraint(self) -> None:
        request = LatencyOptimizationRequest(
            candidates=self.candidates,
            max_latency_ms=Decimal("300"),
        )

        result = LatencyOptimizer().optimize(request)

        self.assertEqual(
            result.selected_model,
            "fast-model",
        )
        self.assertEqual(
            result.candidates_feasible,
            1,
        )

    def test_cost_constraint(self) -> None:
        request = LatencyOptimizationRequest(
            candidates=self.candidates,
            max_cost=Decimal("0.001"),
        )

        result = LatencyOptimizer().optimize(request)

        self.assertEqual(
            result.selected_model,
            "slow-model",
        )

    def test_quality_constraint(self) -> None:
        request = LatencyOptimizationRequest(
            candidates=self.candidates,
            min_quality_score=Decimal("0.94"),
        )

        result = LatencyOptimizer().optimize(request)

        self.assertEqual(
            result.selected_model,
            "balanced-model",
        )

    def test_combined_constraints(self) -> None:
        request = LatencyOptimizationRequest(
            candidates=self.candidates,
            max_cost=Decimal("0.003"),
            min_quality_score=Decimal("0.91"),
            max_latency_ms=Decimal("500"),
        )

        result = LatencyOptimizer().optimize(request)

        self.assertEqual(
            result.selected_model,
            "fast-model",
        )

    def test_filter_feasible_candidates(self) -> None:
        request = LatencyOptimizationRequest(
            candidates=self.candidates,
            max_latency_ms=Decimal("500"),
        )

        feasible = filter_feasible_candidates(
            self.candidates,
            request,
        )

        self.assertEqual(
            len(feasible),
            2,
        )

    def test_no_candidates(self) -> None:
        request = LatencyOptimizationRequest(
            candidates=[],
        )

        with self.assertRaises(
            NoLatencyOptimizationCandidateError
        ):
            LatencyOptimizer().optimize(request)

    def test_no_feasible_candidates(self) -> None:
        request = LatencyOptimizationRequest(
            candidates=self.candidates,
            max_latency_ms=Decimal("100"),
        )

        with self.assertRaises(
            NoFeasibleLatencyCandidateError
        ):
            LatencyOptimizer().optimize(request)

    def test_reduction_utilities(self) -> None:
        reduction = calculate_latency_reduction(
            Decimal("1000"),
            Decimal("250"),
        )

        percentage = (
            calculate_latency_reduction_percentage(
                Decimal("1000"),
                Decimal("250"),
            )
        )

        self.assertEqual(
            reduction,
            Decimal("750"),
        )
        self.assertEqual(
            percentage,
            Decimal("75"),
        )

    def test_selector(self) -> None:
        selector = LowestLatencyCandidateSelector()

        request = LatencyOptimizationRequest(
            candidates=self.candidates,
        )

        selected = selector.select(
            self.candidates,
            request,
        )

        self.assertEqual(
            selected.model,
            "fast-model",
        )

    def test_predictor(self) -> None:
        predictor = LatencyPredictor()

        predictor.register(
            model="fast-model",
            provider="provider-b",
            latency_ms=Decimal("180"),
        )

        self.assertEqual(
            predictor.predict(
                "fast-model",
                "provider-b",
            ),
            Decimal("180"),
        )

        self.assertTrue(
            predictor.has_prediction(
                "fast-model",
                "provider-b",
            )
        )

    def test_profiler(self) -> None:
        profiler = LatencyProfiler()

        profiler.record(
            "fast-model",
            "provider-b",
            Decimal("180"),
        )
        profiler.record(
            "fast-model",
            "provider-b",
            Decimal("220"),
        )

        profile = profiler.profile(
            "fast-model",
            "provider-b",
        )

        self.assertEqual(
            profile.latency_ms,
            Decimal("200"),
        )
        self.assertEqual(
            profile.sample_count,
            2,
        )

    def test_accelerator(self) -> None:
        accelerator = LatencyAccelerator()

        accelerator.register_strategy(
            "cache",
            Decimal("25"),
        )

        result = accelerator.accelerate(
            model="fast-model",
            provider="provider-b",
            latency_ms=Decimal("200"),
            strategy="cache",
        )

        self.assertEqual(
            result.accelerated_latency_ms,
            Decimal("150"),
        )
        self.assertEqual(
            result.reduction_ms,
            Decimal("50"),
        )
        self.assertEqual(
            result.reduction_percentage,
            Decimal("25"),
        )


if __name__ == "__main__":
    unittest.main()
