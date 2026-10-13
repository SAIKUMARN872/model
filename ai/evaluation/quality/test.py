"""Tests for ModelNow quality evaluation."""

import unittest

from ai.evaluation.quality import (
    QualityGrader,
    evaluate_quality,
    evaluate_quality_batch,
    grade_answer,
    rate_quality,
    token_precision_recall_f1,
)


class TestQualityEvaluation(unittest.TestCase):
    def test_identical_answer_and_reference(self):
        result = evaluate_quality("Python is useful", reference="Python is useful")
        self.assertEqual(result["quality_score"], 1.0)
        self.assertEqual(result["metrics"]["relevance"], 1.0)
        self.assertEqual(result["metrics"]["completeness"], 1.0)

    def test_partial_reference_match(self):
        result = evaluate_quality(
            "Python is useful", reference="Python is very useful"
        )
        self.assertGreater(result["quality_score"], 0.0)
        self.assertLess(result["quality_score"], 1.0)

    def test_no_reference_overlap(self):
        result = evaluate_quality("Cats sleep", reference="Databases store records")
        self.assertEqual(result["quality_score"], 0.0)

    def test_case_insensitive_matching(self):
        result = evaluate_quality("PYTHON IS USEFUL", reference="python is useful")
        self.assertEqual(result["quality_score"], 1.0)

    def test_required_points_completeness(self):
        result = evaluate_quality(
            "Python supports automation.",
            required_points=["Python", "automation", "database"],
        )
        self.assertAlmostEqual(result["metrics"]["completeness"], 2 / 3, places=4)

    def test_context_alignment(self):
        result = evaluate_quality(
            "Python supports automation",
            context="Python is a programming language for automation",
        )
        self.assertAlmostEqual(result["metrics"]["context_alignment"], 2 / 3, places=4)

    def test_context_alignment_is_disclosed_as_heuristic(self):
        result = evaluate_quality("Python is useful", context="Python is a language")
        self.assertTrue(result["details"]["context_alignment_is_not_fact_verification"])

    def test_question_heuristic(self):
        result = evaluate_quality(
            "Python supports automation", question="How does Python support automation?"
        )
        self.assertIn("relevance", result["metrics"])
        self.assertIn("question_token_coverage_heuristic", result["details"]["relevance_method"])

    def test_no_available_comparison(self):
        result = evaluate_quality("An answer without comparison")
        self.assertEqual(result["quality_score"], 0.0)
        self.assertEqual(result["metric_count"], 0)

    def test_empty_answer_rejected(self):
        with self.assertRaises(ValueError):
            evaluate_quality(" ")

    def test_non_string_answer_rejected(self):
        with self.assertRaises(TypeError):
            evaluate_quality(123)

    def test_invalid_required_points_rejected(self):
        with self.assertRaises(TypeError):
            evaluate_quality("An answer", required_points="not a list")

    def test_precision_recall_f1(self):
        result = token_precision_recall_f1("a b", "a c")
        self.assertAlmostEqual(result["precision"], 0.5)
        self.assertAlmostEqual(result["recall"], 0.5)
        self.assertAlmostEqual(result["f1"], 0.5)

    def test_batch_evaluation(self):
        result = evaluate_quality_batch(
            ["alpha beta", "gamma delta"],
            references=["alpha beta", "gamma"],
        )
        self.assertEqual(result["sample_count"], 2)
        self.assertEqual(len(result["results"]), 2)

    def test_batch_length_mismatch(self):
        with self.assertRaises(ValueError):
            evaluate_quality_batch(["one", "two"], references=["one"])

    def test_empty_batch_rejected(self):
        with self.assertRaises(ValueError):
            evaluate_quality_batch([])

    def test_rating_threshold(self):
        rating = rate_quality(0.8, threshold=0.75)
        self.assertEqual(rating.label, "good")
        self.assertTrue(rating.passed)

    def test_rating_failure(self):
        rating = rate_quality(0.4, threshold=0.7)
        self.assertEqual(rating.label, "poor")
        self.assertFalse(rating.passed)

    def test_invalid_rating_rejected(self):
        with self.assertRaises(ValueError):
            rate_quality(1.1)
        with self.assertRaises(ValueError):
            rate_quality(0.5, threshold=-0.1)

    def test_grader(self):
        result = QualityGrader(threshold=0.7).grade(
            "Python is useful", reference="Python is useful"
        )
        self.assertEqual(result["rating"]["label"], "excellent")
        self.assertTrue(result["rating"]["passed"])

    def test_convenience_grader(self):
        result = grade_answer(
            "Python is useful", reference="Python is useful", threshold=0.8
        )
        self.assertTrue(result["rating"]["passed"])


if __name__ == "__main__":
    unittest.main()

