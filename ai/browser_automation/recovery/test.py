"""Unit tests for browser automation recovery."""

import unittest

from ai.browser_automation.recovery import (
    BrowserCheckpoint,
    FailureKind,
    RecoveryManager,
    RetryPolicy,
    classify_failure,
)


class CheckpointTests(unittest.TestCase):
    def test_creates_and_serializes_checkpoint(self):
        checkpoint = BrowserCheckpoint(
            task_id="task-1",
            completed_action_ids=["a1"],
            next_action_index=1,
            state={"page": "catalog"},
        )
        data = checkpoint.to_dict()
        self.assertEqual(data["task_id"], "task-1")
        self.assertEqual(data["next_action_index"], 1)

    def test_rejects_invalid_checkpoint(self):
        with self.assertRaises(ValueError):
            BrowserCheckpoint(task_id=" ", next_action_index=0)
        with self.assertRaises(ValueError):
            BrowserCheckpoint(task_id="task-1", next_action_index=-1)


class FailureTests(unittest.TestCase):
    def test_timeout_is_retryable(self):
        decision = classify_failure(TimeoutError("navigation timeout"))
        self.assertEqual(decision.kind, FailureKind.TRANSIENT)
        self.assertTrue(decision.retryable)

    def test_permission_failure_is_not_retryable(self):
        decision = classify_failure(PermissionError("denied"))
        self.assertFalse(decision.retryable)

    def test_uncertain_external_effect_requires_reconciliation(self):
        decision = classify_failure(
            TimeoutError("checkout timed out"),
            external_side_effect_possible=True,
        )
        self.assertEqual(decision.kind, FailureKind.UNKNOWN_OUTCOME)
        self.assertFalse(decision.retryable)


class RetryPolicyTests(unittest.TestCase):
    def test_retry_is_bounded(self):
        policy = RetryPolicy(max_attempts=3, jitter=False)
        transient = classify_failure(TimeoutError("timeout"))
        self.assertTrue(policy.should_retry(transient, 1))
        self.assertTrue(policy.should_retry(transient, 2))
        self.assertFalse(policy.should_retry(transient, 3))

    def test_backoff_is_capped(self):
        policy = RetryPolicy(
            max_attempts=5,
            base_delay_seconds=1,
            max_delay_seconds=2,
            jitter=False,
        )
        self.assertEqual(policy.delay_seconds(1), 1)
        self.assertEqual(policy.delay_seconds(3), 2)

    def test_rejects_invalid_policy(self):
        with self.assertRaises(ValueError):
            RetryPolicy(max_attempts=0)
        with self.assertRaises(ValueError):
            RetryPolicy(base_delay_seconds=5, max_delay_seconds=2)


class RecoveryManagerTests(unittest.TestCase):
    def test_retries_transient_failure(self):
        manager = RecoveryManager(RetryPolicy(jitter=False))
        result = manager.decide(TimeoutError("timeout"), attempt=1)
        self.assertEqual(result.action, "retry")

    def test_stops_permanent_failure(self):
        manager = RecoveryManager()
        result = manager.decide(RuntimeError("unexpected state"), attempt=1)
        self.assertEqual(result.action, "stop")

    def test_reconciles_uncertain_side_effect(self):
        manager = RecoveryManager()
        result = manager.decide(
            TimeoutError("checkout timeout"),
            attempt=1,
            external_side_effect_possible=True,
        )
        self.assertEqual(result.action, "reconcile")

    def test_validates_resume_checkpoint(self):
        manager = RecoveryManager()
        checkpoint = manager.create_checkpoint("task-1", next_action_index=2)
        self.assertEqual(
            manager.validate_resume(checkpoint, task_id="task-1", action_count=5),
            2,
        )
        with self.assertRaises(ValueError):
            manager.validate_resume(checkpoint, task_id="task-2", action_count=5)
        with self.assertRaises(ValueError):
            manager.validate_resume(checkpoint, task_id="task-1", action_count=1)

    def test_checkpoint_state_is_copied(self):
        manager = RecoveryManager()
        original = {"nested": {"value": 1}}
        checkpoint = manager.create_checkpoint("task-1", state=original)
        original["nested"]["value"] = 2
        self.assertEqual(checkpoint.state["nested"]["value"], 1)


if __name__ == "__main__":
    unittest.main()
