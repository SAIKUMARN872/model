from __future__ import annotations

import unittest
from decimal import Decimal

from ..models import OptimizationCandidate

from .evaluator import QualityEvaluator
from .optimizer import QualityOptimizer
from .scorer import (
    QualityScorer,
    WeightedQualityScorer,
)
from .utils import (
    calculate_quality_improvement,
    calculate_quality_improvement_percentage,
    filter_feasible_candidates,
    rank_by_quality,
)


class QualityOptimizerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.candidates = [
            OptimizationCandidate(
                model="basic-model",
                provider="provider-a",
                estimated_cost=Decimal("0.001"),
                estimated_latency_ms=Decimal("200"),
                quality_score=Decimal("0.80"),
            ),
            OptimizationCandidate(
                model="quality-model",
                provider="provider-b",
                estimated_cost=Decimal("0.005"),
                estimated_latency_ms=Decimal("500"),
                quality_score=Decimal("0.98"),
            ),
            OptimizationCandidate(
                model="balanced-model",
                provider="provider-c",
                estimated_cost=Decimal("0.003"),
                estimated_latency_ms=Decimal("300"),
                quality_score=Decimal("0.92"),
            ),
        ]

    def test_highest_quality_selection(self) -> None:
        result = QualityOptimizer().optimize(
            self.candidates
        )

        self.assertEqual(
            result.selected_model,
            "quality-model",
        )
        self.assertEqual(
            result.selected_provider,
            "provider-b",
        )
        self.assertEqual(
            result.selected_quality_score,
            Decimal("0.98"),
        )

    def test_baseline_improvement(self) -> None:
        result = QualityOptimizer().optimize(
            self.candidates,
            current_model="basic-model",
            current_provider="provider-a",
        )

        self.assertEqual(
            result.baseline_quality_score,
            Decimal("0.80"),
        )
        self.assertEqual(
            result.quality_improvement,
            Decimal("0.18"),
        )
        self.assertEqual(
            result.quality_improvement_percentage,
            Decimal("22.5"),
        )
        self.assertTrue(result.optimized)

    def test_keep_current_route(self) -> None:
        result = QualityOptimizer().optimize(
            self.candidates,
            current_model="quality-model",
            current_provider="provider-b",
        )

        self.assertEqual(
            result.selected_model,
            "quality-model",
        )
        self.assertFalse(result.optimized)
        self.assertEqual(
            result.quality_improvement,
            Decimal("0"),
        )

    def test_quality_constraint(self) -> None:
        result = QualityOptimizer().optimize(
            self.candidates,
            min_quality_score=Decimal("0.90"),
        )

        self.assertEqual(
            result.selected_model,
            "quality-model",
        )
        self.assertEqual(
            result.candidates_feasible,
            2,
        )

    def test_cost_constraint(self) -> None:
        result = QualityOptimizer().optimize(
            self.candidates,
            max_cost=Decimal("0.003"),
        )

        self.assertEqual(
            result.selected_model,
            "balanced-model",
        )

    def test_latency_constraint(self) -> None:
        result = QualityOptimizer().optimize(
            self.candidates,
            max_latency_ms=Decimal("300"),
        )

        self.assertEqual(
            result.selected_model,
            "balanced-model",
        )

    def test_combined_constraints(self) -> None:
        result = QualityOptimizer().optimize(
            self.candidates,
            min_quality_score=Decimal("0.90"),
            max_cost=Decimal("0.003"),
            max_latency_ms=Decimal("300"),
        )

        self.assertEqual(
            result.selected_model,
            "balanced-model",
        )
        self.assertEqual(
            result.selected_provider,
            "provider-c",
        )

    def test_no_candidates(self) -> None:
        with self.assertRaises(ValueError):
            QualityOptimizer().optimize([])

    def test_no_feasible_candidates(self) -> None:
        with self.assertRaises(ValueError):
            QualityOptimizer().optimize(
                self.candidates,
                min_quality_score=Decimal("0.99"),
            )

    def test_quality_scorer(self) -> None:
        scorer = QualityScorer()

        score = scorer.score(
            self.candidates[1]
        )

        self.assertEqual(
            score.model,
            "quality-model",
        )
        self.assertEqual(
            score.quality_score,
            Decimal("0.98"),
        )

    def test_quality_ranking(self) -> None:
        scorer = QualityScorer()

        ranked = scorer.rank(
            self.candidates
        )

        self.assertEqual(
            ranked[0].model,
            "quality-model",
        )
        self.assertEqual(
            ranked[1].model,
            "balanced-model",
        )
        self.assertEqual(
            ranked[2].model,
            "basic-model",
        )

    def test_best_quality_candidate(self) -> None:
        scorer = QualityScorer()

        best = scorer.best(
            self.candidates
        )

        self.assertEqual(
            best.model,
            "quality-model",
        )

    def test_weighted_quality_scorer(self) -> None:
        scorer = WeightedQualityScorer(
            quality_weight=Decimal("1"),
            latency_weight=Decimal("0.0001"),
            cost_weight=Decimal("1"),
        )

        score = scorer.score(
            self.candidates[1]
        )

        expected = (
            Decimal("0.98")
            - (
                Decimal("0.0001")
                * Decimal("500")
            )
            - Decimal("0.005")
        )

        self.assertEqual(
            score,
            expected,
        )

    def test_quality_evaluator(self) -> None:
        evaluator = QualityEvaluator()

        result = evaluator.evaluate(
            self.candidates[1],
            min_quality_score=Decimal("0.95"),
            rank=1,
        )

        self.assertTrue(
            result.meets_requirement
        )
        self.assertEqual(
            result.quality_gap,
            Decimal("0"),
        )
        self.assertEqual(
            result.rank,
            1,
        )

    def test_quality_evaluator_gap(self) -> None:
        evaluator = QualityEvaluator()

        result = evaluator.evaluate(
            self.candidates[0],
            min_quality_score=Decimal("0.90"),
            rank=3,
        )

        self.assertFalse(
            result.meets_requirement
        )
        self.assertEqual(
            result.quality_gap,
            Decimal("0.10"),
        )

    def test_evaluate_all(self) -> None:
        evaluator = QualityEvaluator()

        results = evaluator.evaluate_all(
            self.candidates
        )

        self.assertEqual(
            len(results),
            3,
        )
        self.assertEqual(
            results[0].model,
            "quality-model",
        )
        self.assertEqual(
            results[0].rank,
            1,
        )

    def test_improvement_utilities(self) -> None:
        improvement = calculate_quality_improvement(
            Decimal("0.80"),
            Decimal("0.95"),
        )

        percentage = (
            calculate_quality_improvement_percentage(
                Decimal("0.80"),
                Decimal("0.95"),
            )
        )

        self.assertEqual(
            improvement,
            Decimal("0.15"),
        )
        self.assertEqual(
            percentage,
            Decimal("18.75"),
        )

    def test_filter_feasible_candidates(self) -> None:
        feasible = filter_feasible_candidates(
            self.candidates,
            min_quality_score=Decimal("0.90"),
            max_cost=Decimal("0.005"),
            max_latency_ms=Decimal("500"),
        )

        self.assertEqual(
            len(feasible),
            2,
        )

    def test_rank_by_quality(self) -> None:
        ranked = rank_by_quality(
            self.candidates
        )

        self.assertEqual(
            ranked[0].model,
            "quality-model",
        )

    def test_quality_validation_rejection(self) -> None:
        with self.assertRaises(ValueError):
            QualityScorer().score(
                OptimizationCandidate(
                    model="invalid-model",
                    provider="provider-x",
                    estimated_cost=Decimal("0.001"),
                    estimated_latency_ms=Decimal("100"),
                    quality_score=Decimal("1.50"),
                )
            )


if __name__ == "__main__":
    unittest.main()
