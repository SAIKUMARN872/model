from __future__ import annotations

import unittest
from decimal import Decimal

from .learning import (
    RoutingLearning,
    RoutingLearningStore,
    RoutingOutcome,
)
from .optimizer import (
    RoutingCandidate,
    RoutingOptimizer,
)
from .policy import (
    RoutingOptimizationObjective,
    RoutingOptimizationPolicy,
    create_balanced_policy,
    create_cost_policy,
    create_latency_policy,
    create_quality_policy,
)


def candidate(
    model: str,
    provider: str,
    cost: str,
    latency: str,
    quality: str,
) -> RoutingCandidate:
    return RoutingCandidate(
        model=model,
        provider=provider,
        estimated_cost=Decimal(cost),
        estimated_latency_ms=Decimal(latency),
        quality_score=Decimal(quality),
    )


class RoutingPolicyTests(unittest.TestCase):

    def test_balanced_policy(self) -> None:
        policy = create_balanced_policy()

        self.assertEqual(
            policy.objective,
            RoutingOptimizationObjective.BALANCED,
        )

        weights = policy.normalized_weights()

        self.assertAlmostEqual(
            float(sum(weights.values())),
            1.0,
            places=6,
        )

    def test_cost_policy(self) -> None:
        policy = create_cost_policy()

        self.assertEqual(
            policy.objective,
            RoutingOptimizationObjective.COST,
        )

        self.assertGreater(
            policy.normalized_weights()["cost"],
            policy.normalized_weights()["quality"],
        )

    def test_latency_policy(self) -> None:
        policy = create_latency_policy()

        self.assertEqual(
            policy.objective,
            RoutingOptimizationObjective.LATENCY,
        )

        self.assertGreater(
            policy.normalized_weights()["latency"],
            policy.normalized_weights()["cost"],
        )

    def test_quality_policy(self) -> None:
        policy = create_quality_policy()

        self.assertEqual(
            policy.objective,
            RoutingOptimizationObjective.QUALITY,
        )

        self.assertGreater(
            policy.normalized_weights()["quality"],
            policy.normalized_weights()["cost"],
        )

    def test_invalid_weights(self) -> None:
        with self.assertRaises(ValueError):
            RoutingOptimizationPolicy(
                cost_weight=Decimal("-1"),
            )

    def test_invalid_quality_constraint(self) -> None:
        with self.assertRaises(ValueError):
            RoutingOptimizationPolicy(
                minimum_quality=Decimal("2"),
            )


class RoutingLearningTests(unittest.TestCase):

    def test_record_outcome(self) -> None:
        store = RoutingLearningStore()

        outcome = RoutingOutcome(
            model="model-a",
            provider="provider-a",
            cost=Decimal("0.01"),
            latency_ms=Decimal("100"),
            quality_score=Decimal("0.90"),
        )

        store.record(outcome)

        self.assertEqual(store.size(), 1)

    def test_statistics(self) -> None:
        store = RoutingLearningStore()

        store.record_result(
            model="model-a",
            provider="provider-a",
            cost=Decimal("0.01"),
            latency_ms=Decimal("100"),
            quality_score=Decimal("0.80"),
            success=True,
        )

        store.record_result(
            model="model-a",
            provider="provider-a",
            cost=Decimal("0.03"),
            latency_ms=Decimal("200"),
            quality_score=Decimal("1.00"),
            success=False,
        )

        statistics = store.statistics(
            "model-a",
            "provider-a",
        )

        self.assertIsNotNone(statistics)
        assert statistics is not None

        self.assertEqual(statistics.sample_count, 2)
        self.assertEqual(statistics.success_count, 1)
        self.assertEqual(statistics.failure_count, 1)
        self.assertEqual(
            statistics.average_cost,
            Decimal("0.02"),
        )
        self.assertEqual(
            statistics.average_latency_ms,
            Decimal("150"),
        )
        self.assertEqual(
            statistics.average_quality_score,
            Decimal("0.90"),
        )
        self.assertEqual(
            statistics.success_rate,
            Decimal("0.5"),
        )

    def test_best_route(self) -> None:
        learning = RoutingLearning()

        learning.observe_result(
            model="cheap-model",
            provider="provider-a",
            cost=Decimal("0.001"),
            latency_ms=Decimal("100"),
            quality_score=Decimal("0.70"),
        )

        learning.observe_result(
            model="quality-model",
            provider="provider-b",
            cost=Decimal("0.01"),
            latency_ms=Decimal("150"),
            quality_score=Decimal("0.95"),
        )

        best = learning.recommend_route(
            minimum_quality=Decimal("0.80"),
        )

        self.assertIsNotNone(best)
        assert best is not None

        self.assertEqual(best.model, "quality-model")
        self.assertEqual(best.provider, "provider-b")

    def test_clear_learning(self) -> None:
        store = RoutingLearningStore()

        store.record_result(
            model="model-a",
            provider="provider-a",
            cost=Decimal("0.01"),
            latency_ms=Decimal("100"),
            quality_score=Decimal("0.90"),
        )

        self.assertEqual(store.size(), 1)

        store.clear()

        self.assertEqual(store.size(), 0)


class RoutingOptimizerTests(unittest.TestCase):

    def setUp(self) -> None:
        self.candidates = [
            candidate(
                "slm-model",
                "provider-a",
                "0.001",
                "80",
                "0.72",
            ),
            candidate(
                "mlm-model",
                "provider-b",
                "0.005",
                "120",
                "0.88",
            ),
            candidate(
                "llm-model",
                "provider-c",
                "0.020",
                "250",
                "0.97",
            ),
        ]

    def test_balanced_optimization(self) -> None:
        optimizer = RoutingOptimizer(
            policy=create_balanced_policy(),
        )

        result = optimizer.optimize(
            self.candidates,
            current_model="slm-model",
            current_provider="provider-a",
        )

        self.assertIn(
            result.selected_model,
            {
                "slm-model",
                "mlm-model",
                "llm-model",
            },
        )

        self.assertGreaterEqual(
            result.score,
            Decimal("0"),
        )

        self.assertEqual(
            result.candidates_evaluated,
            3,
        )

    def test_cost_policy_prefers_lower_cost(self) -> None:
        policy = RoutingOptimizationPolicy(
            objective=RoutingOptimizationObjective.COST,
            cost_weight=Decimal("0.90"),
            latency_weight=Decimal("0.05"),
            quality_weight=Decimal("0.05"),
        )

        optimizer = RoutingOptimizer(policy=policy)

        result = optimizer.optimize(
            self.candidates,
        )

        self.assertEqual(
            result.selected_model,
            "slm-model",
        )

    def test_quality_constraint(self) -> None:
        policy = RoutingOptimizationPolicy(
            minimum_quality=Decimal("0.90"),
        )

        optimizer = RoutingOptimizer(policy=policy)

        result = optimizer.optimize(
            self.candidates,
        )

        self.assertIn(
            result.selected_model,
            {
                "llm-model",
            },
        )

        self.assertGreaterEqual(
            result.quality_score,
            Decimal("0.90"),
        )

    def test_latency_constraint(self) -> None:
        policy = RoutingOptimizationPolicy(
            maximum_latency_ms=Decimal("100"),
        )

        optimizer = RoutingOptimizer(policy=policy)

        result = optimizer.optimize(
            self.candidates,
        )

        self.assertEqual(
            result.selected_model,
            "slm-model",
        )

        self.assertLessEqual(
            result.estimated_latency_ms,
            Decimal("100"),
        )

    def test_cost_constraint(self) -> None:
        policy = RoutingOptimizationPolicy(
            maximum_cost=Decimal("0.006"),
        )

        optimizer = RoutingOptimizer(policy=policy)

        result = optimizer.optimize(
            self.candidates,
        )

        self.assertNotEqual(
            result.selected_model,
            "llm-model",
        )

        self.assertLessEqual(
            result.estimated_cost,
            Decimal("0.006"),
        )

    def test_model_switch_disabled(self) -> None:
        policy = RoutingOptimizationPolicy(
            objective=RoutingOptimizationObjective.QUALITY,
            allow_model_switch=False,
        )

        optimizer = RoutingOptimizer(policy=policy)

        result = optimizer.optimize(
            self.candidates,
            current_model="slm-model",
            current_provider="provider-a",
        )

        self.assertEqual(
            result.selected_model,
            "slm-model",
        )

    def test_provider_switch_disabled(self) -> None:
        policy = RoutingOptimizationPolicy(
            objective=RoutingOptimizationObjective.QUALITY,
            allow_provider_switch=False,
        )

        optimizer = RoutingOptimizer(policy=policy)

        result = optimizer.optimize(
            self.candidates,
            current_model="slm-model",
            current_provider="provider-a",
        )

        self.assertEqual(
            result.selected_provider,
            "provider-a",
        )

    def test_current_route_can_remain(self) -> None:
        policy = RoutingOptimizationPolicy(
            objective=RoutingOptimizationObjective.COST,
            cost_weight=Decimal("1"),
            latency_weight=Decimal("0"),
            quality_weight=Decimal("0"),
        )

        optimizer = RoutingOptimizer(policy=policy)

        result = optimizer.optimize(
            self.candidates,
            current_model="slm-model",
            current_provider="provider-a",
        )

        self.assertFalse(result.changed)
        self.assertEqual(
            result.selected_model,
            "slm-model",
        )

    def test_learning_improves_route_score(self) -> None:
        learning = RoutingLearning()

        learning.observe_result(
            model="mlm-model",
            provider="provider-b",
            cost=Decimal("0.005"),
            latency_ms=Decimal("120"),
            quality_score=Decimal("0.95"),
            success=True,
        )

        optimizer = RoutingOptimizer(
            policy=create_balanced_policy(),
            learning=learning,
        )

        result = optimizer.optimize(
            self.candidates,
        )

        self.assertEqual(
            result.selected_model,
            "mlm-model",
        )

    def test_no_candidates(self) -> None:
        optimizer = RoutingOptimizer()

        with self.assertRaises(ValueError):
            optimizer.optimize([])

    def test_no_feasible_candidates(self) -> None:
        policy = RoutingOptimizationPolicy(
            minimum_quality=Decimal("0.99"),
        )

        optimizer = RoutingOptimizer(policy=policy)

        with self.assertRaises(ValueError):
            optimizer.optimize(self.candidates)


if __name__ == "__main__":
    unittest.main()
