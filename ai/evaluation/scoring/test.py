"""Tests for ModelNow evaluation scoring."""
import unittest

from ai.evaluation.scoring import (
    DEFAULT_SCORING_WEIGHTS,
    rank_models_by_comparison,
    score_model,
    score_models,
    validate_weights,
)


class ScoringTests(unittest.TestCase):
    def test_default_weights_sum_to_one(self):
        self.assertAlmostEqual(sum(validate_weights().values()), 1.0)

    def test_custom_weights_are_normalized(self):
        result = validate_weights({"quality": 2, "cost": 2})
        self.assertEqual(result, {"quality": 0.5, "cost": 0.5})

    def test_invalid_weights_rejected(self):
        for weights in ({}, {"unknown": 1}, {"quality": 0}, {"quality": True}):
            with self.subTest(weights=weights), self.assertRaises(ValueError):
                validate_weights(weights)

    def test_weighted_score(self):
        result = score_model({
            "quality": 1.0,
            "latency": 0.8,
            "cost": 0.6,
            "reliability": 1.0,
        })
        expected = (
            1.0 * DEFAULT_SCORING_WEIGHTS["quality"]
            + 0.8 * DEFAULT_SCORING_WEIGHTS["latency"]
            + 0.6 * DEFAULT_SCORING_WEIGHTS["cost"]
            + 1.0 * DEFAULT_SCORING_WEIGHTS["reliability"]
        )
        self.assertAlmostEqual(result["score"], expected)
        self.assertEqual(result["metric_coverage"], 1.0)

    def test_missing_metrics_renormalize_weights(self):
        result = score_model({"quality": 0.8, "cost": None})
        self.assertEqual(result["score"], 0.8)
        self.assertEqual(result["metric_coverage"], 0.25)
        self.assertEqual(result["weights_used"], {"quality": 1.0})

    def test_invalid_metric_rejected(self):
        for value in (-0.1, 1.1, float("nan"), True, "0.5"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                score_model({"quality": value})

    def test_empty_usable_metrics_rejected(self):
        with self.assertRaises(ValueError):
            score_model({"quality": None})

    def test_score_models_ranked_descending(self):
        results = score_models({
            "model-a": {"quality": 0.6},
            "model-b": {"quality": 0.9},
        }, {"quality": 1.0})
        self.assertEqual([item["model_name"] for item in results],
                         ["model-b", "model-a"])
        self.assertEqual([item["rank"] for item in results], [1, 2])

    def test_comparison_ranker_is_reused(self):
        result = rank_models_by_comparison({
            "model-a": {"quality_score": 0.8, "latency_ms": 20, "cost_usd": 0.01},
            "model-b": {"quality_score": 0.9, "latency_ms": 10, "cost_usd": 0.02},
        })
        self.assertEqual(result[0]["model_name"], "model-b")

    def test_invalid_model_name_rejected(self):
        with self.assertRaises(ValueError):
            score_models({" ": {"quality": 0.5}})


if __name__ == "__main__":
    unittest.main(verbosity=2)
