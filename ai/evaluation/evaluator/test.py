"""Unit tests for ModelNow evaluator orchestration."""
import unittest

from ai.evaluation.datasets import DatasetCase, EvaluationDataset
from ai.evaluation.exceptions import EvaluationValidationError
from ai.evaluation.evaluator import (
    EvaluationPipeline,
    EvaluationRunner,
    ResponseEvaluator,
    results_to_dict,
    validate_results,
)
from ai.evaluation.models import EvaluationCase, EvaluationResult


class ResponseEvaluatorTests(unittest.TestCase):
    def setUp(self):
        self.evaluator = ResponseEvaluator()

    def test_reference_metrics_are_added(self):
        result = self.evaluator.evaluate(
            EvaluationCase("c1", "model-a", "blue sky", "blue sky")
        )
        self.assertEqual(result.metrics["exact_match"], True)
        self.assertEqual(result.metrics["quality_heuristic_score"], 1.0)

    def test_context_diagnostics_are_added(self):
        result = self.evaluator.evaluate(
            EvaluationCase(
                "c2", "model-a", "ModelNow uses AI.",
                context="ModelNow uses AI for evaluation.",
            )
        )
        self.assertIn("hallucination_support_rate", result.metrics)
        self.assertIn("hallucination_diagnostics", result.metadata)

    def test_missing_reference_and_context_has_no_quality_diagnostic(self):
        result = self.evaluator.evaluate(
            EvaluationCase("c3", "model-a", "A response.")
        )
        self.assertNotIn("quality_heuristic_score", result.metrics)

    def test_quality_can_be_disabled(self):
        result = ResponseEvaluator(include_quality=False).evaluate(
            EvaluationCase("c4", "model-a", "yes", "yes")
        )
        self.assertNotIn("quality_heuristic_score", result.metrics)
        self.assertIn("exact_match", result.metrics)

    def test_hallucination_check_can_be_disabled(self):
        result = ResponseEvaluator(
            include_hallucination_check=False
        ).evaluate(
            EvaluationCase(
                "c5", "model-a", "A response.",
                context="A response in context.",
            )
        )
        self.assertNotIn("hallucination_support_rate", result.metrics)

    def test_batch_evaluation(self):
        cases = [
            EvaluationCase("b1", "model-a", "yes", "yes"),
            EvaluationCase("b2", "model-a", "no", "yes"),
        ]
        results = self.evaluator.evaluate_batch(cases)
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0].quality_score, 1.0)
        self.assertEqual(results[1].quality_score, 0.0)

    def test_invalid_batch_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.evaluator.evaluate_batch("not cases")


class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.dataset = EvaluationDataset(
            name="demo",
            cases=(
                DatasetCase("1", "What is 2 + 2?", "4"),
                DatasetCase("2", "What is the capital of France?", "Paris"),
            ),
        )
        self.pipeline = EvaluationPipeline()

    def test_build_cases_from_list(self):
        cases = self.pipeline.build_cases(
            self.dataset, ["4", "Paris"], "model-a"
        )
        self.assertEqual(len(cases), 2)
        self.assertEqual(cases[0].answer, "4")
        self.assertEqual(cases[0].reference_answer, "4")
        self.assertEqual(cases[0].metadata["dataset_name"], "demo")

    def test_predictions_mapping_uses_case_ids(self):
        results = self.pipeline.run(
            self.dataset, {"2": "Paris", "1": "4"}, "model-a"
        )
        self.assertEqual([item.case_id for item in results], ["1", "2"])
        self.assertTrue(all(item.quality_score == 1.0 for item in results))

    def test_wrong_prediction_count_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.pipeline.build_cases(self.dataset, ["4"], "model-a")

    def test_missing_prediction_id_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.pipeline.build_cases(
                self.dataset, {"1": "4"}, "model-a"
            )

    def test_blank_prediction_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.pipeline.build_cases(
                self.dataset, ["4", " "], "model-a"
            )

    def test_invalid_model_name_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.pipeline.build_cases(self.dataset, ["4", "Paris"], " ")

    def test_measurements_are_preserved(self):
        results = self.pipeline.run(
            self.dataset,
            ["4", "Paris"],
            "model-a",
            measurements={
                "1": {
                    "latency_ms": 12.0,
                    "cost_usd": 0.001,
                    "input_tokens": 8,
                    "output_tokens": 2,
                }
            },
        )
        self.assertEqual(results[0].metrics["latency_ms"], 12.0)
        self.assertEqual(results[0].metrics["total_tokens"], 10)

    def test_unknown_measurement_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.pipeline.build_cases(
                self.dataset,
                ["4", "Paris"],
                "model-a",
                measurements={"1": {"unknown_metric": 1}},
            )


class RunnerAndUtilityTests(unittest.TestCase):
    def test_runner_returns_results_and_summary(self):
        dataset = EvaluationDataset(
            name="runner-demo",
            cases=(DatasetCase("r1", "2 + 2?", "4"),),
        )
        report = EvaluationRunner().run(dataset, ["4"], "model-a")
        self.assertEqual(report["status"], "completed")
        self.assertEqual(report["case_count"], 1)
        self.assertEqual(len(report["results"]), 1)
        self.assertEqual(report["summaries"][0].model_name, "model-a")

    def test_results_to_dict(self):
        result = EvaluationResult(
            case_id="1",
            model_name="model-a",
            metrics={"exact_match": 1.0},
            quality_score=1.0,
        )
        output = results_to_dict([result])
        self.assertEqual(output[0]["case_id"], "1")
        self.assertEqual(output[0]["metrics"]["exact_match"], 1.0)

    def test_invalid_results_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            validate_results([{"case_id": "not a result"}])

    def test_empty_results_are_valid(self):
        self.assertEqual(validate_results([]), [])
        self.assertEqual(results_to_dict([]), [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
