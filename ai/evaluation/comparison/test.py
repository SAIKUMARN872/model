"""Tests for ModelNow model comparison and ranking."""
import unittest

from ai.evaluation.comparison.compare import compare_models, best_model
from ai.evaluation.comparison.model_compare import compare_evaluation_cases
from ai.evaluation.comparison.ranking import rank_models
from ai.evaluation.models import EvaluationCase


class ComparisonTests(unittest.TestCase):
    def test_quality_wins_when_other_metrics_equal(self):
        result = rank_models({
            "model-a": {"quality_score": 0.9, "mean_latency_ms": 100, "mean_cost_usd": 0.01},
            "model-b": {"quality_score": 0.7, "mean_latency_ms": 100, "mean_cost_usd": 0.01},
        })
        self.assertEqual(result[0]["model_name"], "model-a")
        self.assertEqual(result[0]["rank"], 1)

    def test_lower_latency_is_better(self):
        result = rank_models({
            "slow": {"mean_latency_ms": 200},
            "fast": {"mean_latency_ms": 50},
        }, weights={"latency": 1})
        self.assertEqual(result[0]["model_name"], "fast")

    def test_lower_cost_is_better(self):
        result = rank_models({
            "expensive": {"mean_cost_usd": 0.2},
            "cheap": {"mean_cost_usd": 0.01},
        }, weights={"cost": 1})
        self.assertEqual(result[0]["model_name"], "cheap")

    def test_reliability_higher_is_better(self):
        result = rank_models({
            "a": {"success_rate": 0.8},
            "b": {"success_rate": 0.99},
        }, weights={"reliability": 1})
        self.assertEqual(result[0]["model_name"], "b")

    def test_constant_metric_ties(self):
        result = rank_models({
            "a": {"mean_latency_ms": 100},
            "b": {"mean_latency_ms": 100},
        }, weights={"latency": 1})
        self.assertEqual(result[0]["score"], result[1]["score"])

    def test_ties_are_deterministic_by_name(self):
        result = rank_models({
            "zeta": {"quality_score": 1},
            "alpha": {"quality_score": 1},
        }, weights={"quality": 1})
        self.assertEqual(result[0]["model_name"], "alpha")

    def test_missing_metrics_are_not_perfect(self):
        result = rank_models({
            "complete": {"quality_score": 0.8, "mean_latency_ms": 100},
            "missing": {"quality_score": 0.8},
        })
        missing = next(item for item in result if item["model_name"] == "missing")
        self.assertAlmostEqual(missing["metric_coverage"], 1 / 3)
        self.assertNotIn("latency", missing["normalized_metrics"])

    def test_no_comparable_metrics_returns_empty(self):
        result = rank_models({
            "a": {"quality_score": None},
            "b": {"mean_latency_ms": None},
        })
        self.assertEqual(result, [])

    def test_unknown_weight_rejected(self):
        with self.assertRaises(ValueError):
            rank_models({"a": {"quality_score": 1}}, weights={"unknown": 1})

    def test_zero_weight_rejected(self):
        with self.assertRaises(ValueError):
            rank_models({"a": {"quality_score": 1}}, weights={"quality": 0})

    def test_invalid_metric_rejected(self):
        with self.assertRaises(ValueError):
            rank_models({"a": {"quality_score": 1.5}})

    def test_nan_metric_rejected(self):
        with self.assertRaises(ValueError):
            rank_models({"a": {"mean_latency_ms": float("nan")}})

    def test_negative_cost_rejected(self):
        with self.assertRaises(ValueError):
            rank_models({"a": {"mean_cost_usd": -1}})

    def test_empty_input_rejected(self):
        with self.assertRaises(ValueError):
            rank_models({})

    def test_compare_benchmark_shape(self):
        result = compare_models({
            "benchmark": "llm",
            "models": {
                "a": {"exact_match_rate": 0.9, "mean_latency_ms": 100, "mean_cost_usd": 0.01},
                "b": {"exact_match_rate": 0.7, "mean_latency_ms": 150, "mean_cost_usd": 0.02},
            },
        })
        self.assertEqual(result["model_count"], 2)
        self.assertEqual(result["ranking"][0]["model_name"], "a")

    def test_best_model(self):
        result = best_model({
            "a": {"quality_score": 0.3},
            "b": {"quality_score": 0.8},
        }, weights={"quality": 1})
        self.assertEqual(result["model_name"], "b")

    def test_no_best_model_without_metrics(self):
        self.assertIsNone(best_model({"a": {"quality_score": None}}))

    def test_compare_rejects_invalid_mapping(self):
        with self.assertRaises(ValueError):
            compare_models([])

    def test_evaluation_cases_comparison(self):
        cases = [
            EvaluationCase(
                case_id="a1", model_name="model-a", answer="correct",
                reference_answer="correct", latency_ms=100, cost_usd=0.01,
            ),
            EvaluationCase(
                case_id="b1", model_name="model-b", answer="wrong",
                reference_answer="correct", latency_ms=200, cost_usd=0.02,
            ),
        ]
        result = compare_evaluation_cases(cases)
        self.assertEqual(result["case_count"], 2)
        self.assertEqual(result["ranking"][0]["model_name"], "model-a")

    def test_evaluation_cases_empty_rejected(self):
        with self.assertRaises(ValueError):
            compare_evaluation_cases([])

    def test_custom_weights(self):
        result = rank_models({
            "quality-first": {"quality_score": 1, "mean_latency_ms": 200},
            "latency-first": {"quality_score": 0, "mean_latency_ms": 10},
        }, weights={"quality": 0.99, "latency": 0.01})
        self.assertEqual(result[0]["model_name"], "quality-first")


if __name__ == "__main__":
    unittest.main(verbosity=2)

