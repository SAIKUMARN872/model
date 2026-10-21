from __future__ import annotations

import unittest
from decimal import Decimal

from ..models import (
    OptimizationAction,
    OptimizationCandidate,
    OptimizationObjective,
    OptimizationRequest,
    OptimizationWeights,
)
from .optimizer import Optimizer
from .pipeline import (
    OptimizationPipeline,
    OptimizationPipelineRequest,
)
from .strategy import (
    OptimizationStrategy,
    StrategyManager,
)
from .utils import (
    calculate_weighted_score,
    clamp_decimal,
    is_better_score,
    normalize_score,
    normalize_weights,
    to_decimal,
    validate_candidates,
    validate_request,
)


def make_candidates() -> list[OptimizationCandidate]:
    return [
        OptimizationCandidate(
            model="model-a",
            provider="provider-a",
            estimated_cost=Decimal("0.010"),
            estimated_latency_ms=Decimal("500"),
            quality_score=Decimal("0.80"),
        ),
        OptimizationCandidate(
            model="model-b",
            provider="provider-b",
            estimated_cost=Decimal("0.005"),
            estimated_latency_ms=Decimal("250"),
            quality_score=Decimal("0.90"),
        ),
        OptimizationCandidate(
            model="model-c",
            provider="provider-c",
            estimated_cost=Decimal("0.020"),
            estimated_latency_ms=Decimal("800"),
            quality_score=Decimal("0.70"),
        ),
    ]


class OptimizerUtilsTests(unittest.TestCase):

    def test_to_decimal(self):
        self.assertEqual(
            to_decimal("1.25"),
            Decimal("1.25"),
        )

    def test_to_decimal_invalid(self):
        self.assertEqual(
            to_decimal("invalid"),
            Decimal("0"),
        )

    def test_validate_request(self):
        request = object()
        self.assertIs(validate_request(request), request)

    def test_validate_request_none(self):
        with self.assertRaises(ValueError):
            validate_request(None)

    def test_validate_candidates(self):
        candidates = [1, 2, 3]
        self.assertEqual(
            validate_candidates(candidates),
            candidates,
        )

    def test_validate_candidates_string(self):
        with self.assertRaises(TypeError):
            validate_candidates("invalid")

    def test_normalize_weights(self):
        weights = normalize_weights(
            {
                "cost": "0.5",
                "latency": 0.3,
                "quality": 0.2,
            }
        )

        self.assertEqual(
            weights["cost"],
            Decimal("0.5"),
        )

    def test_normalize_score(self):
        self.assertEqual(
            normalize_score(2),
            Decimal("1"),
        )

        self.assertEqual(
            normalize_score(-1),
            Decimal("0"),
        )

    def test_calculate_weighted_score(self):
        score = calculate_weighted_score(
            {
                "cost": Decimal("1"),
                "latency": Decimal("0.5"),
                "quality": Decimal("0"),
            },
            {
                "cost": Decimal("0.5"),
                "latency": Decimal("0.25"),
                "quality": Decimal("0.25"),
            },
        )

        self.assertEqual(
            score,
            Decimal("0.625"),
        )

    def test_is_better_score(self):
        self.assertTrue(
            is_better_score(
                Decimal("0.8"),
                Decimal("0.7"),
            )
        )

    def test_clamp_decimal(self):
        self.assertEqual(
            clamp_decimal(2),
            Decimal("1"),
        )

        self.assertEqual(
            clamp_decimal(-1),
            Decimal("0"),
        )


class StrategyManagerTests(unittest.TestCase):

    def setUp(self):
        self.manager = StrategyManager()

    def test_default_strategies(self):
        self.assertEqual(
            self.manager.get_weights(
                OptimizationStrategy.COST
            ),
            {
                "cost": 0.8,
                "latency": 0.1,
                "quality": 0.1,
            },
        )

        self.assertEqual(
            self.manager.get_weights(
                OptimizationStrategy.LATENCY
            ),
            {
                "cost": 0.1,
                "latency": 0.8,
                "quality": 0.1,
            },
        )

        self.assertEqual(
            self.manager.get_weights(
                OptimizationStrategy.QUALITY
            ),
            {
                "cost": 0.05,
                "latency": 0.05,
                "quality": 0.9,
            },
        )

    def test_string_strategy(self):
        config = self.manager.get_config("quality")

        self.assertEqual(
            config.strategy,
            OptimizationStrategy.QUALITY,
        )

    def test_set_weights(self):
        config = self.manager.set_weights(
            "balanced",
            {
                "cost": 2,
                "latency": 1,
                "quality": 1,
            },
        )

        self.assertAlmostEqual(
            config.weights.cost,
            0.5,
        )

        self.assertAlmostEqual(
            config.weights.latency,
            0.25,
        )

        self.assertAlmostEqual(
            config.weights.quality,
            0.25,
        )

    def test_invalid_strategy(self):
        with self.assertRaises(ValueError):
            self.manager.get_config("invalid")


class OptimizationPipelineTests(unittest.TestCase):

    def setUp(self):
        self.pipeline = OptimizationPipeline()

    def test_rank(self):
        result = self.pipeline.rank(
            OptimizationPipelineRequest(
                candidates=make_candidates(),
                strategy=OptimizationStrategy.BALANCED,
            )
        )

        self.assertEqual(
            len(result),
            3,
        )

        self.assertEqual(
            result[0].model,
            "model-b",
        )

    def test_run(self):
        result = self.pipeline.run(
            OptimizationPipelineRequest(
                candidates=make_candidates(),
                strategy=OptimizationStrategy.BALANCED,
                current_model="model-a",
                current_provider="provider-a",
            )
        )

        self.assertEqual(
            result.selected_model,
            "model-b",
        )

        self.assertEqual(
            result.selected_provider,
            "provider-b",
        )

        self.assertTrue(result.changed)

    def test_pipeline_scores(self):
        result = self.pipeline.run(
            OptimizationPipelineRequest(
                candidates=make_candidates(),
            )
        )

        scores = result.metadata[
            "pipeline_candidate_scores"
        ]

        self.assertEqual(
            Decimal(scores["cost_score"]),
            Decimal("1"),
        )

        self.assertEqual(
            Decimal(scores["latency_score"]),
            Decimal("1"),
        )

        self.assertEqual(
            Decimal(scores["quality_score"]),
            Decimal("1"),
        )

    def test_empty_candidates(self):
        with self.assertRaises(ValueError):
            self.pipeline.run(
                OptimizationPipelineRequest(
                    candidates=[],
                )
            )


class OptimizerTests(unittest.TestCase):

    def setUp(self):
        self.optimizer = Optimizer()

    def make_request(
        self,
        *,
        objective=OptimizationObjective.BALANCED,
        model="model-a",
        provider="provider-a",
    ):
        return OptimizationRequest(
            model=model,
            provider=provider,
            objective=objective,
            weights=OptimizationWeights(
                cost=Decimal("0.33"),
                latency=Decimal("0.33"),
                quality=Decimal("0.34"),
            ),
            candidates=make_candidates(),
        )

    def test_optimize(self):
        result = self.optimizer.optimize(
            self.make_request()
        )

        self.assertEqual(
            result.decision.selected_model,
            "model-b",
        )

        self.assertEqual(
            result.decision.selected_provider,
            "provider-b",
        )

        self.assertEqual(
            result.decision.action,
            OptimizationAction.SWITCH_MODEL,
        )

        self.assertTrue(
            result.decision.optimized
        )

    def test_real_normalized_scores(self):
        result = self.optimizer.optimize(
            self.make_request()
        )

        score = result.decision.score

        self.assertIsNotNone(score)

        self.assertEqual(
            score.cost_score,
            Decimal("1"),
        )

        self.assertEqual(
            score.latency_score,
            Decimal("1"),
        )

        self.assertEqual(
            score.quality_score,
            Decimal("1"),
        )

        self.assertEqual(
            score.total_score,
            Decimal("1"),
        )

    def test_keep_current_route(self):
        request = self.make_request(
            model="model-b",
            provider="provider-b",
        )

        result = self.optimizer.optimize(request)

        self.assertEqual(
            result.decision.action,
            OptimizationAction.KEEP,
        )

        self.assertFalse(
            result.decision.optimized
        )

    def test_switch_provider(self):
        candidates = [
            OptimizationCandidate(
                model="model-a",
                provider="provider-a",
                estimated_cost=Decimal("0.010"),
                estimated_latency_ms=Decimal("500"),
                quality_score=Decimal("0.80"),
            ),
            OptimizationCandidate(
                model="model-a",
                provider="provider-b",
                estimated_cost=Decimal("0.005"),
                estimated_latency_ms=Decimal("250"),
                quality_score=Decimal("0.90"),
            ),
        ]

        request = OptimizationRequest(
            model="model-a",
            provider="provider-a",
            objective=OptimizationObjective.BALANCED,
            candidates=candidates,
        )

        result = self.optimizer.optimize(request)

        self.assertEqual(
            result.decision.action,
            OptimizationAction.SWITCH_PROVIDER,
        )

    def test_rank(self):
        result = self.optimizer.rank(
            self.make_request()
        )

        self.assertEqual(
            len(result),
            3,
        )

        self.assertEqual(
            result[0].model,
            "model-b",
        )

    def test_constraints(self):
        from ..models import OptimizationConstraints

        request = OptimizationRequest(
            objective=OptimizationObjective.BALANCED,
            constraints=OptimizationConstraints(
                max_cost=Decimal("0.006"),
            ),
            candidates=make_candidates(),
        )

        result = self.optimizer.optimize(request)

        self.assertEqual(
            result.candidates_evaluated,
            3,
        )

        self.assertEqual(
            result.candidates_feasible,
            1,
        )

        self.assertEqual(
            result.decision.selected_model,
            "model-b",
        )

    def test_no_feasible_candidates(self):
        from ..models import OptimizationConstraints

        request = OptimizationRequest(
            constraints=OptimizationConstraints(
                max_cost=Decimal("0.001"),
            ),
            candidates=make_candidates(),
        )

        with self.assertRaises(ValueError):
            self.optimizer.optimize(request)

    def test_no_candidates(self):
        request = OptimizationRequest()

        with self.assertRaises(ValueError):
            self.optimizer.optimize(request)

    def test_invalid_request_type(self):
        with self.assertRaises(TypeError):
            self.optimizer.optimize("invalid")


if __name__ == "__main__":
    unittest.main()
