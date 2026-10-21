from decimal import Decimal
import unittest

from .engine import OptimizationEngine
from .exceptions import (
    InvalidOptimizationCandidateError,
    NoFeasibleCandidateError,
    NoOptimizationCandidateError,
)
from .models import (
    OptimizationAction,
    OptimizationCandidate,
    OptimizationConstraints,
    OptimizationObjective,
    OptimizationRequest,
    OptimizationWeights,
)
from .utils import (
    candidate_is_feasible,
    filter_feasible_candidates,
    normalize_weights,
    weighted_score,
)


class OptimizationEngineTest(unittest.TestCase):

    def setUp(self) -> None:
        self.candidates = [
            OptimizationCandidate(
                model="test-slm",
                provider="provider-a",
                estimated_cost=Decimal("0.001"),
                estimated_latency_ms=Decimal("50"),
                quality_score=Decimal("0.80"),
            ),
            OptimizationCandidate(
                model="test-mlm",
                provider="provider-b",
                estimated_cost=Decimal("0.005"),
                estimated_latency_ms=Decimal("100"),
                quality_score=Decimal("0.90"),
            ),
            OptimizationCandidate(
                model="test-llm",
                provider="provider-c",
                estimated_cost=Decimal("0.020"),
                estimated_latency_ms=Decimal("200"),
                quality_score=Decimal("0.98"),
            ),
        ]

        self.engine = OptimizationEngine()

    def test_candidate_scoring(self) -> None:
        request = OptimizationRequest(
            candidates=self.candidates,
            objective=OptimizationObjective.BALANCED,
        )

        score = self.engine.evaluate(
            request,
            self.candidates[1],
        )

        self.assertEqual(
            score.model,
            "test-mlm",
        )

        self.assertGreaterEqual(
            score.cost_score,
            Decimal("0"),
        )

        self.assertLessEqual(
            score.cost_score,
            Decimal("1"),
        )

        self.assertGreaterEqual(
            score.latency_score,
            Decimal("0"),
        )

        self.assertLessEqual(
            score.latency_score,
            Decimal("1"),
        )

        self.assertGreaterEqual(
            score.quality_score,
            Decimal("0"),
        )

        self.assertLessEqual(
            score.quality_score,
            Decimal("1"),
        )

        self.assertGreater(
            score.total_score,
            Decimal("0"),
        )

    def test_optimization(self) -> None:
        request = OptimizationRequest(
            model="test-llm",
            provider="provider-c",
            candidates=self.candidates,
            objective=OptimizationObjective.BALANCED,
        )

        result = self.engine.optimize(request)

        self.assertEqual(
            result.candidates_evaluated,
            3,
        )

        self.assertEqual(
            result.candidates_feasible,
            3,
        )

        self.assertIsNotNone(
            result.decision.selected_model
        )

        self.assertIsNotNone(
            result.decision.score
        )

        self.assertTrue(
            result.decision.optimized
        )

    def test_constraint_filtering(self) -> None:
        constraints = OptimizationConstraints(
            max_cost=Decimal("0.006"),
        )

        request = OptimizationRequest(
            candidates=self.candidates,
            constraints=constraints,
        )

        result = self.engine.optimize(request)

        self.assertEqual(
            result.candidates_feasible,
            2,
        )

        self.assertNotEqual(
            result.decision.selected_model,
            "test-llm",
        )

    def test_quality_constraint(self) -> None:
        constraints = OptimizationConstraints(
            min_quality_score=Decimal("0.95"),
        )

        request = OptimizationRequest(
            candidates=self.candidates,
            constraints=constraints,
        )

        result = self.engine.optimize(request)

        self.assertEqual(
            result.candidates_feasible,
            1,
        )

        self.assertEqual(
            result.decision.selected_model,
            "test-llm",
        )

    def test_latency_constraint(self) -> None:
        constraints = OptimizationConstraints(
            max_latency_ms=Decimal("75"),
        )

        request = OptimizationRequest(
            candidates=self.candidates,
            constraints=constraints,
        )

        result = self.engine.optimize(request)

        self.assertEqual(
            result.candidates_feasible,
            1,
        )

        self.assertEqual(
            result.decision.selected_model,
            "test-slm",
        )

    def test_allowed_models(self) -> None:
        constraints = OptimizationConstraints(
            allowed_models=[
                "test-mlm",
                "test-llm",
            ]
        )

        request = OptimizationRequest(
            candidates=self.candidates,
            constraints=constraints,
        )

        result = self.engine.optimize(request)

        self.assertEqual(
            result.candidates_feasible,
            2,
        )

        self.assertNotEqual(
            result.decision.selected_model,
            "test-slm",
        )

    def test_allowed_providers(self) -> None:
        constraints = OptimizationConstraints(
            allowed_providers=[
                "provider-a",
            ]
        )

        request = OptimizationRequest(
            candidates=self.candidates,
            constraints=constraints,
        )

        result = self.engine.optimize(request)

        self.assertEqual(
            result.candidates_feasible,
            1,
        )

        self.assertEqual(
            result.decision.selected_provider,
            "provider-a",
        )

    def test_no_candidates(self) -> None:
        request = OptimizationRequest(
            candidates=[],
        )

        with self.assertRaises(
            NoOptimizationCandidateError
        ):
            self.engine.optimize(request)

    def test_no_feasible_candidates(self) -> None:
        constraints = OptimizationConstraints(
            max_cost=Decimal("0.0005"),
        )

        request = OptimizationRequest(
            candidates=self.candidates,
            constraints=constraints,
        )

        with self.assertRaises(
            NoFeasibleCandidateError
        ):
            self.engine.optimize(request)

    def test_invalid_candidate(self) -> None:
        invalid_candidate = OptimizationCandidate(
            model="",
            provider="provider-a",
            estimated_cost=Decimal("0.001"),
            estimated_latency_ms=Decimal("50"),
            quality_score=Decimal("0.80"),
        )

        request = OptimizationRequest(
            candidates=[invalid_candidate],
        )

        with self.assertRaises(
            InvalidOptimizationCandidateError
        ):
            self.engine.optimize(request)

    def test_weight_normalization(self) -> None:
        weights = OptimizationWeights(
            cost=Decimal("1"),
            latency=Decimal("2"),
            quality=Decimal("7"),
        )

        normalized = normalize_weights(weights)

        self.assertEqual(
            normalized.total,
            Decimal("1"),
        )

        self.assertEqual(
            normalized.cost,
            Decimal("0.1"),
        )

        self.assertEqual(
            normalized.latency,
            Decimal("0.2"),
        )

        self.assertEqual(
            normalized.quality,
            Decimal("0.7"),
        )

    def test_weighted_score(self) -> None:
        weights = OptimizationWeights(
            cost=Decimal("0.5"),
            latency=Decimal("0.25"),
            quality=Decimal("0.25"),
        )

        score = weighted_score(
            cost_score=Decimal("1"),
            latency_score=Decimal("0.5"),
            quality_score=Decimal("0.8"),
            weights=weights,
        )

        self.assertEqual(
            score,
            Decimal("0.825"),
        )

    def test_candidate_feasibility(self) -> None:
        constraints = OptimizationConstraints(
            max_cost=Decimal("0.010"),
            max_latency_ms=Decimal("150"),
            min_quality_score=Decimal("0.85"),
        )

        self.assertTrue(
            candidate_is_feasible(
                self.candidates[1],
                constraints,
            )
        )

        self.assertFalse(
            candidate_is_feasible(
                self.candidates[0],
                constraints,
            )
        )

        feasible = filter_feasible_candidates(
            self.candidates,
            constraints,
        )

        self.assertEqual(
            len(feasible),
            1,
        )

        self.assertEqual(
            feasible[0].model,
            "test-mlm",
        )


if __name__ == "__main__":
    unittest.main()
