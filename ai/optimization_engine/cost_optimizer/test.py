import unittest
from decimal import Decimal

from ..models import OptimizationCandidate
from .exceptions import (
    NoCostOptimizationCandidateError,
    NoFeasibleCostCandidateError,
)
from .models import CostOptimizationRequest
from .optimizer import CostOptimizer
from .utils import (
    calculate_savings,
    calculate_savings_percentage,
    filter_feasible_candidates,
    is_feasible,
)


class CostOptimizerTest(unittest.TestCase):

    def setUp(self):
        self.candidates = [
            OptimizationCandidate(
                model="slm-model",
                provider="provider-a",
                estimated_cost=Decimal("0.001"),
                estimated_latency_ms=Decimal("100"),
                quality_score=Decimal("0.80"),
            ),
            OptimizationCandidate(
                model="mlm-model",
                provider="provider-b",
                estimated_cost=Decimal("0.005"),
                estimated_latency_ms=Decimal("80"),
                quality_score=Decimal("0.90"),
            ),
            OptimizationCandidate(
                model="llm-model",
                provider="provider-c",
                estimated_cost=Decimal("0.020"),
                estimated_latency_ms=Decimal("60"),
                quality_score=Decimal("0.98"),
            ),
        ]

    def test_lowest_cost_selection(self):
        request = CostOptimizationRequest(
            candidates=self.candidates,
            current_model="llm-model",
            current_provider="provider-c",
        )

        result = CostOptimizer().optimize(request)

        self.assertEqual(result.selected_model, "slm-model")
        self.assertEqual(
            result.selected_provider,
            "provider-a",
        )
        self.assertEqual(
            result.selected_cost,
            Decimal("0.001"),
        )

    def test_baseline_savings(self):
        request = CostOptimizationRequest(
            candidates=self.candidates,
            current_model="llm-model",
            current_provider="provider-c",
        )

        result = CostOptimizer().optimize(request)

        self.assertEqual(
            result.baseline_cost,
            Decimal("0.020"),
        )
        self.assertEqual(
            result.savings,
            Decimal("0.019"),
        )
        self.assertEqual(
            result.savings_percentage,
            Decimal("95.00"),
        )
        self.assertTrue(result.optimized)

    def test_keep_current_route(self):
        request = CostOptimizationRequest(
            candidates=self.candidates,
            current_model="slm-model",
            current_provider="provider-a",
        )

        result = CostOptimizer().optimize(request)

        self.assertEqual(
            result.selected_model,
            "slm-model",
        )
        self.assertEqual(
            result.baseline_cost,
            Decimal("0.001"),
        )
        self.assertEqual(
            result.savings,
            Decimal("0"),
        )
        self.assertFalse(result.optimized)

    def test_latency_constraint(self):
        request = CostOptimizationRequest(
            candidates=self.candidates,
            max_latency_ms=Decimal("90"),
        )

        result = CostOptimizer().optimize(request)

        self.assertEqual(
            result.selected_model,
            "mlm-model",
        )

    def test_quality_constraint(self):
        request = CostOptimizationRequest(
            candidates=self.candidates,
            min_quality_score=Decimal("0.95"),
        )

        result = CostOptimizer().optimize(request)

        self.assertEqual(
            result.selected_model,
            "llm-model",
        )

    def test_cost_constraint(self):
        request = CostOptimizationRequest(
            candidates=self.candidates,
            max_cost=Decimal("0.004"),
        )

        result = CostOptimizer().optimize(request)

        self.assertEqual(
            result.selected_model,
            "slm-model",
        )

    def test_candidate_feasibility(self):
        request = CostOptimizationRequest(
            candidates=self.candidates,
            max_latency_ms=Decimal("90"),
            min_quality_score=Decimal("0.85"),
        )

        self.assertFalse(
            is_feasible(
                self.candidates[0],
                request,
            )
        )

        self.assertTrue(
            is_feasible(
                self.candidates[1],
                request,
            )
        )

    def test_filter_feasible_candidates(self):
        request = CostOptimizationRequest(
            candidates=self.candidates,
            max_cost=Decimal("0.005"),
        )

        feasible = filter_feasible_candidates(
            self.candidates,
            request,
        )

        self.assertEqual(len(feasible), 2)

    def test_no_candidates(self):
        request = CostOptimizationRequest(
            candidates=[],
        )

        with self.assertRaises(
            NoCostOptimizationCandidateError
        ):
            CostOptimizer().optimize(request)

    def test_no_feasible_candidates(self):
        request = CostOptimizationRequest(
            candidates=self.candidates,
            max_cost=Decimal("0.0001"),
        )

        with self.assertRaises(
            NoFeasibleCostCandidateError
        ):
            CostOptimizer().optimize(request)

    def test_savings_utilities(self):
        savings = calculate_savings(
            Decimal("0.020"),
            Decimal("0.005"),
        )

        percentage = calculate_savings_percentage(
            Decimal("0.020"),
            Decimal("0.005"),
        )

        self.assertEqual(
            savings,
            Decimal("0.015"),
        )
        self.assertEqual(
            percentage,
            Decimal("75.00"),
        )


if __name__ == "__main__":
    unittest.main()
