"""Tests for the ModelNow action confirmation package."""

import unittest

from ai.action_platform.confirmation import (
    ActionConfirmationManager,
    ActionConfirmationResult,
    ActionConfirmationVerifier,
    confirmation_result,
)


class ActionConfirmationTests(unittest.TestCase):
    def setUp(self):
        self.verifier = ActionConfirmationVerifier()

    def test_success_requires_confirmation_id(self):
        result = self.verifier.verify(
            "task-1",
            {"status": "completed", "confirmation_id": "CONF-1"},
        )
        self.assertTrue(result.confirmed)
        self.assertEqual(result.status, "confirmed")

    def test_success_without_confirmation_id_is_unverified(self):
        result = self.verifier.verify(
            "task-1",
            {"status": "completed"},
        )
        self.assertFalse(result.confirmed)
        self.assertEqual(result.status, "unverified")

    def test_pending_is_not_confirmed(self):
        result = self.verifier.verify("task-2", {"status": "pending"})
        self.assertFalse(result.confirmed)
        self.assertEqual(result.status, "pending")

    def test_task_id_mismatch_is_unverified(self):
        result = self.verifier.verify(
            "task-3",
            {
                "task_id": "different-task",
                "status": "completed",
                "confirmation_id": "CONF-3",
            },
        )
        self.assertFalse(result.confirmed)
        self.assertEqual(result.status, "unverified")

    def test_manager_preserves_terminal_confirmation(self):
        manager = ActionConfirmationManager()
        first = manager.verify_and_record(
            "task-4",
            {"status": "completed", "confirmation_id": "CONF-4"},
        )
        second = manager.verify_and_record(
            "task-4",
            {"status": "failed"},
        )
        self.assertEqual(first, second)
        self.assertTrue(manager.is_confirmed("task-4"))

    def test_result_distinguishes_operation_success_from_confirmation(self):
        pending = self.verifier.verify("task-5", {"status": "pending"})
        result = confirmation_result(pending)
        self.assertIsInstance(result, ActionConfirmationResult)
        self.assertTrue(result.success)
        self.assertFalse(result.confirmed)

    def test_failed_operation_requires_error_or_record(self):
        with self.assertRaises(ValueError):
            ActionConfirmationResult(success=False)


if __name__ == "__main__":
    unittest.main(verbosity=2)
