"""Unit tests for ModelNow human feedback."""
import unittest

from ai.evaluation.feedback import (
    analyze_feedback,
    collect_feedback,
    feedback_to_dict,
    submit_feedback,
    validate_feedback,
)


class FeedbackCollectorTests(unittest.TestCase):
    def test_collect_feedback(self):
        record = collect_feedback("case-1", "test-slm", 5, "Helpful answer")
        self.assertEqual(record.case_id, "case-1")
        self.assertEqual(record.rating, 5)
        self.assertTrue(record.feedback_id)
        self.assertTrue(record.created_at)

    def test_metadata_is_copied(self):
        metadata = {"source": "chat"}
        record = collect_feedback("case-1", "test-slm", 4, metadata=metadata)
        metadata["source"] = "changed"
        self.assertEqual(record.metadata["source"], "chat")

    def test_invalid_identifiers_rejected(self):
        for case_id, model in (("", "model"), ("case", " ")):
            with self.subTest(case_id=case_id, model=model):
                with self.assertRaises(ValueError):
                    collect_feedback(case_id, model, 3)

    def test_invalid_ratings_rejected(self):
        for rating in (0, 6, True, 2.5, "5"):
            with self.subTest(rating=rating), self.assertRaises(ValueError):
                collect_feedback("case-1", "test-slm", rating)

    def test_invalid_comment_and_metadata_rejected(self):
        with self.assertRaises(ValueError):
            collect_feedback("case-1", "test-slm", 4, comment=None)
        with self.assertRaises(ValueError):
            validate_feedback("case-1", "test-slm", 4, metadata=[])

    def test_serialization(self):
        record = collect_feedback("case-1", "test-slm", 4)
        data = feedback_to_dict(record)
        self.assertEqual(data["feedback_id"], record.feedback_id)
        self.assertEqual(data["rating"], 4)

    def test_submit_feedback(self):
        data = submit_feedback("case-2", "test-llm", 5, "Great")
        self.assertEqual(data["model_name"], "test-llm")
        self.assertEqual(data["comment"], "Great")


class FeedbackAnalyzerTests(unittest.TestCase):
    def test_aggregate_counts_and_model_summary(self):
        records = [
            collect_feedback("1", "test-slm", 5),
            collect_feedback("2", "test-slm", 4),
            collect_feedback("3", "test-llm", 3),
            collect_feedback("4", "test-llm", 1),
        ]
        result = analyze_feedback(records)
        self.assertEqual(result["feedback_count"], 4)
        self.assertEqual(result["positive_count"], 2)
        self.assertEqual(result["neutral_count"], 1)
        self.assertEqual(result["negative_count"], 1)
        self.assertEqual(result["by_model"]["test-slm"]["mean_rating"], 4.5)

    def test_empty_feedback(self):
        result = analyze_feedback([])
        self.assertEqual(result["feedback_count"], 0)
        self.assertIsNone(result["mean_rating"])
        self.assertIsNone(result["positive_rate"])

    def test_invalid_records_rejected(self):
        with self.assertRaises(ValueError):
            analyze_feedback([{"rating": 5}])

    def test_generator_input(self):
        records = (
            collect_feedback(str(i), "test-slm", rating)
            for i, rating in enumerate((3, 5))
        )
        self.assertEqual(analyze_feedback(records)["feedback_count"], 2)


if __name__ == "__main__":
    unittest.main(verbosity=2)
