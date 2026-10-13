"""Tests for ModelNow hallucination evaluation."""

import unittest

from ai.evaluation.hallucination import (
    HallucinationChecker,
    calculate_hallucination_metrics,
    check_hallucinations,
    detect_claims,
    split_claims,
    token_coverage,
)


class TestHallucinationEvaluation(unittest.TestCase):
    def test_split_claims(self):
        self.assertEqual(
            split_claims("Python is useful. It supports automation!"),
            ["Python is useful.", "It supports automation!"],
        )

    def test_empty_answer_rejected(self):
        with self.assertRaises(ValueError):
            split_claims("  ")

    def test_non_string_answer_rejected(self):
        with self.assertRaises(TypeError):
            split_claims(42)

    def test_context_must_be_nonempty(self):
        with self.assertRaises(ValueError):
            detect_claims("A claim.", " ")

    def test_token_coverage(self):
        self.assertAlmostEqual(
            token_coverage("Python supports automation", "Python supports tools"),
            2 / 3,
        )

    def test_fully_overlapping_claim(self):
        claims = detect_claims(
            "Python supports automation.",
            "Python supports automation for teams.",
        )
        self.assertEqual(claims[0]["label"], "supported_overlap")
        self.assertEqual(claims[0]["token_coverage"], 1.0)

    def test_low_overlap_claim_flagged(self):
        claims = detect_claims(
            "Mars has three moons.",
            "Python is a programming language.",
        )
        self.assertEqual(claims[0]["label"], "unsupported_or_unclear")

    def test_possible_negation_conflict(self):
        claims = detect_claims(
            "The service is not available.",
            "The service is available today.",
        )
        self.assertEqual(claims[0]["label"], "possible_contradiction")

    def test_negation_check_requires_shared_content(self):
        claims = detect_claims(
            "The database is not available.",
            "Python supports automation.",
        )
        self.assertEqual(claims[0]["label"], "unsupported_or_unclear")

    def test_case_insensitive_overlap(self):
        claims = detect_claims("PYTHON IS USEFUL.", "Python is useful.")
        self.assertEqual(claims[0]["token_coverage"], 1.0)

    def test_checker_counts(self):
        result = check_hallucinations(
            "Python supports automation. Mars has three moons.",
            "Python supports automation for teams.",
        )
        self.assertEqual(result["claim_count"], 2)
        self.assertEqual(result["supported_claim_count"], 1)
        self.assertEqual(result["unsupported_or_unclear_claim_count"], 1)

    def test_checker_rates_sum_to_one(self):
        result = check_hallucinations(
            "Python supports automation. Mars has three moons.",
            "Python supports automation for teams.",
        )
        rates = result["metrics"]
        self.assertAlmostEqual(
            rates["support_rate"] + rates["unsupported_or_unclear_rate"]
            + rates["possible_contradiction_rate"],
            1.0,
        )

    def test_checker_rejects_non_string_context(self):
        with self.assertRaises(TypeError):
            check_hallucinations("A claim.", None)

    def test_checker_wrapper(self):
        result = HallucinationChecker().check(
            "Python supports automation.", "Python supports automation."
        )
        self.assertEqual(result["claim_count"], 1)

    def test_empty_metrics(self):
        result = calculate_hallucination_metrics([])
        self.assertEqual(result["claim_count"], 0)
        self.assertEqual(result["support_rate"], 0.0)

    def test_aggregate_metrics(self):
        claims = [
            {"label": "supported_overlap"},
            {"label": "unsupported_or_unclear"},
            {"label": "possible_contradiction"},
            {"label": "supported_overlap"},
        ]
        result = calculate_hallucination_metrics(claims)
        self.assertEqual(result["claim_count"], 4)
        self.assertEqual(result["supported_claim_count"], 2)
        self.assertEqual(result["unsupported_or_unclear_claim_count"], 1)
        self.assertEqual(result["possible_contradiction_count"], 1)
        self.assertEqual(result["support_rate"], 0.5)

    def test_invalid_metrics_argument(self):
        with self.assertRaises(TypeError):
            calculate_hallucination_metrics("invalid")

    def test_invalid_claim_label(self):
        with self.assertRaises(ValueError):
            calculate_hallucination_metrics([{"label": "unknown"}])

    def test_invalid_claim_item(self):
        with self.assertRaises(TypeError):
            calculate_hallucination_metrics(["invalid"])


if __name__ == "__main__":
    unittest.main()
