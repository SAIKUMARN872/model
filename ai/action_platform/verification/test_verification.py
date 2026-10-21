"""Unit tests for ModelNow action verification."""

import unittest

from ai.action_platform.verification import (
    ActionVerifier,
    RecoveryManager,
    VerificationResult,
    check_expected_values,
    check_required_fields,
    check_status,
)


class VerificationChecksTests(unittest.TestCase):
    def test_required_fields_pass(self):
        checks = check_required_fields(
            {"status": "completed", "order_id": "ORD-1"},
            ("status", "order_id"),
        )
        self.assertTrue(all(checks.values()))

    def test_missing_required_field_fails(self):
        checks = check_required_fields(
            {"status": "completed"},
            ("status", "order_id"),
        )
        self.assertFalse(checks["required:order_id"])

    def test_empty_string_fails_required_check(self):
        checks = check_required_fields(
            {"order_id": "  "},
            ("order_id",),
        )
        self.assertFalse(checks["required:order_id"])

    def test_expected_values_match(self):
        checks = check_expected_values(
            {"currency": "INR", "amount": 100},
            {"currency": "INR", "amount": 100},
        )
        self.assertTrue(all(checks.values()))

    def test_expected_value_mismatch_fails(self):
        checks = check_expected_values(
            {"currency": "USD"},
            {"currency": "INR"},
        )
        self.assertFalse(checks["matches:currency"])

    def test_status_check_is_case_insensitive(self):
        checks = check_status(
            {"status": "COMPLETED"},
            ("completed", "confirmed"),
        )
        self.assertTrue(checks["status:accepted"])


class ActionVerifierTests(unittest.TestCase):
    def setUp(self):
        self.verifier = ActionVerifier()

    def test_successful_action_verifies(self):
        result = self.verifier.verify(
            "action-1",
            {"status": "completed", "order_id": "ORD-1"},
            required_fields=("status", "order_id"),
            expected_values={"order_id": "ORD-1"},
        )
        self.assertTrue(result.verified)
        self.assertEqual(result.status, "completed")

    def test_failed_status_does_not_verify(self):
        result = self.verifier.verify(
            "action-2",
            {"status": "failed"},
        )
        self.assertFalse(result.verified)

    def test_unknown_status_does_not_verify(self):
        result = self.verifier.verify(
            "action-3",
            {"status": "unknown"},
        )
        self.assertFalse(result.verified)

    def test_expected_value_mismatch_does_not_verify(self):
        result = self.verifier.verify(
            "action-4",
            {"status": "completed", "order_id": "ORD-2"},
            expected_values={"order_id": "ORD-1"},
        )
        self.assertFalse(result.verified)

    def test_result_serialization(self):
        result = self.verifier.verify(
            "action-5",
            {"status": "completed"},
        )
        payload = result.to_dict()
        self.assertTrue(payload["verified"])
        self.assertEqual(payload["action_id"], "action-5")
        self.assertIn("checks", payload)

    def test_invalid_payload_rejected(self):
        with self.assertRaises(TypeError):
            self.verifier.verify("action-6", None)


class RecoveryManagerTests(unittest.TestCase):
    def setUp(self):
        self.manager = RecoveryManager()

    def test_unknown_outcome_requires_reconciliation(self):
        decision = self.manager.decide("action-1", "unknown")
        self.assertEqual(decision.decision, "reconcile")
        self.assertFalse(decision.retry_allowed)
        self.assertTrue(decision.requires_human_review)

    def test_non_idempotent_failure_cannot_retry(self):
        decision = self.manager.decide(
            "action-2",
            "failed",
            idempotent=False,
        )
        self.assertFalse(decision.retry_allowed)
        self.assertTrue(decision.requires_human_review)

    def test_idempotent_failure_can_be_retry_candidate(self):
        decision = self.manager.decide(
            "action-3",
            "failed",
            idempotent=True,
            retry_count=0,
            max_retries=2,
        )
        self.assertEqual(decision.decision, "retry_candidate")
        self.assertTrue(decision.retry_allowed)

    def test_retry_limit_blocks_retry(self):
        decision = self.manager.decide(
            "action-4",
            "failed",
            idempotent=True,
            retry_count=2,
            max_retries=2,
        )
        self.assertFalse(decision.retry_allowed)
        self.assertTrue(decision.requires_human_review)

    def test_successful_status_does_not_retry(self):
        decision = self.manager.decide("action-5", "completed")
        self.assertEqual(decision.decision, "no_action")
        self.assertFalse(decision.retry_allowed)

    def test_unrecognized_status_requires_review(self):
        decision = self.manager.decide("action-6", "unexpected")
        self.assertEqual(decision.decision, "manual_review")
        self.assertTrue(decision.requires_human_review)

    def test_invalid_retry_count_rejected(self):
        with self.assertRaises(ValueError):
            self.manager.decide(
                "action-7",
                "failed",
                retry_count=-1,
            )

    def test_recovery_decision_serialization(self):
        decision = self.manager.decide("action-8", "unknown")
        payload = decision.to_dict()
        self.assertEqual(payload["action_id"], "action-8")
        self.assertIn("retry_allowed", payload)


class VerificationResultTests(unittest.TestCase):
    def test_verified_result_rejects_failed_check(self):
        with self.assertRaises(ValueError):
            VerificationResult(
                verified=True,
                action_id="action-1",
                status="completed",
                checks={"status:accepted": False},
            )

    def test_invalid_action_id_rejected(self):
        with self.assertRaises(ValueError):
            VerificationResult(
                verified=False,
                action_id=" ",
                status="unknown",
            )


if __name__ == "__main__":
    unittest.main(verbosity=2)
