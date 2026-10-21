"""Tests for ModelNow A/B testing."""
import unittest

from ai.evaluation.ab_testing import ABTestAnalyzer, Experiment, Variant


class TestABTesting(unittest.TestCase):
    def setUp(self):
        self.experiment = Experiment(
            experiment_id="exp-1",
            control_name="control",
            candidate_name="candidate",
            primary_metric="quality_score",
            minimum_samples=3,
        )
        self.analyzer = ABTestAnalyzer()

    def test_insufficient_samples_are_not_declared_winner(self):
        control = Variant("control", ({"quality_score": 0.7}, {"quality_score": 0.7}))
        candidate = Variant("candidate", ({"quality_score": 0.9}, {"quality_score": 0.9}))
        result = self.analyzer.analyze(self.experiment, control, candidate)
        self.assertFalse(result["sufficient_samples"])
        self.assertEqual(result["decision"], "insufficient_data")

    def test_metrics_are_aggregated(self):
        control = Variant("control", tuple(
            {"quality_score": 0.5, "cost_usd": 0.02, "latency_ms": 100}
            for _ in range(4)
        ))
        candidate = Variant("candidate", tuple(
            {"quality_score": 0.8, "cost_usd": 0.01, "latency_ms": 80}
            for _ in range(4)
        ))
        result = self.analyzer.analyze(self.experiment, control, candidate)
        self.assertAlmostEqual(result["metrics"]["quality_score"]["control"]["mean"], 0.5)
        self.assertAlmostEqual(result["metrics"]["quality_score"]["candidate"]["mean"], 0.8)
        self.assertAlmostEqual(result["metrics"]["cost_usd"]["candidate"]["mean"], 0.01)
        self.assertAlmostEqual(result["metrics"]["latency_ms"]["candidate"]["mean"], 80)

    def test_constant_clear_improvement_is_detected(self):
        control = Variant("control", tuple({"quality_score": 0.5} for _ in range(30)))
        candidate = Variant("candidate", tuple({"quality_score": 0.8} for _ in range(30)))
        result = self.analyzer.analyze(self.experiment, control, candidate)
        self.assertTrue(result["sufficient_samples"])
        self.assertEqual(result["decision"], "candidate_better")

    def test_control_name_must_match(self):
        with self.assertRaises(ValueError):
            self.analyzer.analyze(
                self.experiment,
                Variant("wrong", ()),
                Variant("candidate", ()),
            )

    def test_invalid_quality_rejected(self):
        with self.assertRaises(ValueError):
            self.analyzer.analyze(
                self.experiment,
                Variant("control", ({"quality_score": 1.2},)),
                Variant("candidate", ({"quality_score": 0.8},)),
            )

    def test_negative_cost_rejected(self):
        with self.assertRaises(ValueError):
            self.analyzer.analyze(
                self.experiment,
                Variant("control", ({"cost_usd": -1},)),
                Variant("candidate", ({"cost_usd": 0.1},)),
            )

    def test_missing_primary_metric_requires_more_data(self):
        result = self.analyzer.analyze(
            self.experiment,
            Variant("control", ({"latency_ms": 10},)),
            Variant("candidate", ({"latency_ms": 9},)),
        )
        self.assertEqual(result["decision"], "insufficient_data")

    def test_invalid_experiment_configuration(self):
        with self.assertRaises(ValueError):
            Experiment("exp", "same", "same")

    def test_invalid_minimum_samples(self):
        with self.assertRaises(ValueError):
            Experiment("exp", "control", "candidate", minimum_samples=1)


if __name__ == "__main__":
    unittest.main()
