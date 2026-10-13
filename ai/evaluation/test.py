"""Unit tests for the ModelNow evaluation core."""
import unittest

from ai.evaluation import (
    EvaluationCase,
    EvaluationEngine,
    EvaluationValidationError,
    exact_match,
    lexical_context_overlap,
    token_f1,
    tokenize,
)


class TestEvaluationMetrics(unittest.TestCase):
    def test_tokenize_is_case_insensitive(self):
        self.assertEqual(tokenize("ModelNow AI"), ["modelnow", "ai"])

    def test_exact_match_ignores_case_and_whitespace(self):
        self.assertTrue(exact_match("  Hello   WORLD ", "hello world"))

    def test_exact_match_rejects_different_text(self):
        self.assertFalse(exact_match("hello", "hello world"))

    def test_token_f1_identical_text(self):
        self.assertEqual(token_f1("AI model", "AI model"), 1.0)

    def test_token_f1_no_overlap(self):
        self.assertEqual(token_f1("apple", "orange"), 0.0)

    def test_token_f1_empty_inputs(self):
        self.assertEqual(token_f1("", ""), 1.0)

    def test_token_f1_one_empty_input(self):
        self.assertEqual(token_f1("answer", ""), 0.0)

    def test_token_f1_partial_overlap(self):
        self.assertAlmostEqual(token_f1("red blue", "red green"), 0.5)

    def test_context_overlap(self):
        self.assertAlmostEqual(
            lexical_context_overlap("AI improves search", "AI improves search quality"),
            1.0,
        )

    def test_context_overlap_no_shared_tokens(self):
        self.assertEqual(lexical_context_overlap("cats", "dogs"), 0.0)

    def test_empty_answer_context_overlap(self):
        self.assertEqual(lexical_context_overlap("", "some context"), 1.0)


class TestEvaluationEngine(unittest.TestCase):
    def setUp(self):
        self.engine = EvaluationEngine()

    def test_perfect_evaluation(self):
        case = EvaluationCase(
            "case-1", "model-a", "Correct answer", "Correct answer"
        )
        result = self.engine.evaluate(case)
        self.assertEqual(result.quality_score, 1.0)
        self.assertTrue(result.metrics["exact_match"])
        self.assertEqual(result.metrics["token_f1"], 1.0)

    def test_wrong_answer_scores_zero(self):
        result = self.engine.evaluate(
            EvaluationCase("case-2", "model-a", "Wrong", "Correct")
        )
        self.assertEqual(result.quality_score, 0.0)

    def test_performance_metrics(self):
        result = self.engine.evaluate(
            EvaluationCase(
                "case-3", "model-a", "Answer",
                latency_ms=20, cost_usd=0.01,
                input_tokens=12, output_tokens=8,
            )
        )
        self.assertEqual(result.metrics["total_tokens"], 20)
        self.assertEqual(result.metrics["latency_ms"], 20)
        self.assertEqual(result.metrics["cost_usd"], 0.01)

    def test_missing_performance_data(self):
        result = self.engine.evaluate(
            EvaluationCase("case-4", "model-a", "Answer")
        )
        self.assertIsNone(result.metrics["total_tokens"])
        self.assertIsNone(result.quality_score)

    def test_context_metric_is_included(self):
        result = self.engine.evaluate(
            EvaluationCase(
                "case-5", "model-a", "ModelNow uses AI",
                context="ModelNow uses AI for evaluation",
            )
        )
        self.assertEqual(result.metrics["lexical_context_overlap"], 1.0)

    def test_metadata_is_preserved(self):
        result = self.engine.evaluate(
            EvaluationCase(
                "case-6", "model-a", "Answer",
                metadata={"environment": "test"},
            )
        )
        self.assertEqual(result.metadata["environment"], "test")

    def test_batch_evaluation(self):
        cases = [
            EvaluationCase("b1", "model-a", "yes", "yes"),
            EvaluationCase("b2", "model-b", "no", "yes"),
        ]
        results = self.engine.evaluate_batch(cases)
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0].quality_score, 1.0)
        self.assertEqual(results[1].quality_score, 0.0)

    def test_empty_batch(self):
        self.assertEqual(self.engine.evaluate_batch([]), [])

    def test_invalid_batch_argument(self):
        with self.assertRaises(EvaluationValidationError):
            self.engine.evaluate_batch("not a batch")

    def test_empty_case_id_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.engine.evaluate(EvaluationCase("", "model-a", "Answer"))

    def test_empty_model_name_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.engine.evaluate(EvaluationCase("id", " ", "Answer"))

    def test_non_string_answer_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.engine.evaluate(EvaluationCase("id", "model-a", 123))

    def test_negative_latency_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.engine.evaluate(
                EvaluationCase("id", "model-a", "Answer", latency_ms=-1)
            )

    def test_boolean_cost_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.engine.evaluate(
                EvaluationCase("id", "model-a", "Answer", cost_usd=True)
            )

    def test_non_finite_cost_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.engine.evaluate(
                EvaluationCase("id", "model-a", "Answer", cost_usd=float("inf"))
            )

    def test_negative_tokens_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.engine.evaluate(
                EvaluationCase("id", "model-a", "Answer", input_tokens=-1)
            )

    def test_boolean_token_count_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.engine.evaluate(
                EvaluationCase("id", "model-a", "Answer", input_tokens=True)
            )

    def test_non_dictionary_metadata_rejected(self):
        with self.assertRaises(EvaluationValidationError):
            self.engine.evaluate(
                EvaluationCase("id", "model-a", "Answer", metadata=[])
            )

    def test_model_summary(self):
        results = self.engine.evaluate_batch([
            EvaluationCase(
                "s1", "model-b", "right", "right",
                latency_ms=20, cost_usd=0.02,
                input_tokens=10, output_tokens=5,
            ),
            EvaluationCase(
                "s2", "model-b", "wrong", "right",
                latency_ms=40, cost_usd=0.03,
                input_tokens=20, output_tokens=10,
            ),
            EvaluationCase("s3", "model-a", "answer"),
        ])
        summaries = self.engine.summarize(results)
        self.assertEqual([s.model_name for s in summaries], ["model-a", "model-b"])
        model_b = summaries[1]
        self.assertEqual(model_b.case_count, 2)
        self.assertAlmostEqual(model_b.mean_quality_score, 0.5)
        self.assertEqual(model_b.mean_latency_ms, 30)
        self.assertAlmostEqual(model_b.total_cost_usd, 0.05)
        self.assertEqual(model_b.total_input_tokens, 30)
        self.assertEqual(model_b.total_output_tokens, 15)

    def test_empty_summary(self):
        self.assertEqual(self.engine.summarize([]), [])


if __name__ == "__main__":
    unittest.main()
