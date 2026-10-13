"""Tests for ModelNow accuracy evaluation."""
import unittest

from ai.evaluation.accuracy import (
    AccuracyScorer,
    evaluate_accuracy,
    evaluate_accuracy_batch,
    validate_accuracy_batch,
    validate_accuracy_input,
)


class TestAccuracyEvaluation(unittest.TestCase):
    def test_exact_correct_answer(self):
        result = evaluate_accuracy("ModelNow AI", "ModelNow AI")
        self.assertEqual(result["accuracy_score"], 1.0)
        self.assertEqual(result["token_f1"], 1.0)

    def test_incorrect_answer(self):
        result = evaluate_accuracy("wrong answer", "correct answer")
        self.assertEqual(result["accuracy_score"], 0.0)
        self.assertGreater(result["token_f1"], 0.0)

    def test_case_and_whitespace_normalization(self):
        result = evaluate_accuracy("  MODELNOW   AI ", "modelnow ai")
        self.assertEqual(result["exact_match"], 1.0)

    def test_batch_accuracy(self):
        result = evaluate_accuracy_batch(
            ["yes", "no", "maybe"],
            ["yes", "yes", "maybe"],
        )
        self.assertEqual(result["sample_count"], 3)
        self.assertAlmostEqual(result["exact_match_accuracy"], 2 / 3)

    def test_batch_f1(self):
        result = evaluate_accuracy_batch(["red blue"], ["red green"])
        self.assertAlmostEqual(result["mean_token_f1"], 0.5)

    def test_batch_length_mismatch(self):
        with self.assertRaises(ValueError):
            evaluate_accuracy_batch(["yes"], ["yes", "no"])

    def test_empty_batch_rejected(self):
        with self.assertRaises(ValueError):
            evaluate_accuracy_batch([], [])

    def test_invalid_prediction_rejected(self):
        with self.assertRaises(ValueError):
            evaluate_accuracy(123, "123")

    def test_invalid_reference_rejected(self):
        with self.assertRaises(ValueError):
            evaluate_accuracy("answer", None)

    def test_scorer_exact_match(self):
        scorer = AccuracyScorer()
        self.assertEqual(scorer.score("yes", "yes"), 1.0)
        self.assertEqual(scorer.score("yes", "no"), 0.0)

    def test_scorer_token_f1(self):
        self.assertAlmostEqual(
            AccuracyScorer().score("red blue", "red green", "token_f1"),
            0.5,
        )

    def test_unsupported_metric_rejected(self):
        with self.assertRaises(ValueError):
            AccuracyScorer().score("a", "a", "unsupported")

    def test_batch_scorer(self):
        scores = AccuracyScorer().score_batch(
            ["yes", "no"], ["yes", "yes"]
        )
        self.assertEqual(scores, [1.0, 0.0])

    def test_validation_helpers(self):
        self.assertTrue(validate_accuracy_input("answer", "answer"))
        self.assertTrue(validate_accuracy_batch(["a"], ["a"]))

    def test_validation_rejects_bad_batch(self):
        with self.assertRaises(ValueError):
            validate_accuracy_batch([], [])


if __name__ == "__main__":
    unittest.main()
