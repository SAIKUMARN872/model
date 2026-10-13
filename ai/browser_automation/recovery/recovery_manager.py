"""Recovery coordination and safe checkpoint resumption."""

from __future__ import annotations

import copy
from dataclasses import dataclass
from typing import Any

from .checkpoint import BrowserCheckpoint
from .failure_handler import FailureDecision, classify_failure
from .retry_policy import RetryPolicy


@dataclass(frozen=True)
class RecoveryDecision:
    action: str
    reason: str
    retry_delay_seconds: float = 0.0
    checkpoint: BrowserCheckpoint | None = None


class RecoveryManager:
    """Coordinate recovery decisions without executing browser actions."""

    def __init__(self, retry_policy: RetryPolicy | None = None):
        self.retry_policy = retry_policy or RetryPolicy()

    def create_checkpoint(
        self,
        task_id: str,
        *,
        completed_action_ids: list[str] | None = None,
        next_action_index: int = 0,
        state: dict[str, Any] | None = None,
    ) -> BrowserCheckpoint:
        # Avoid retaining mutable references supplied by callers.
        return BrowserCheckpoint(
            task_id=task_id,
            completed_action_ids=list(completed_action_ids or []),
            next_action_index=next_action_index,
            state=copy.deepcopy(state or {}),
        )

    def decide(
        self,
        error: BaseException,
        *,
        attempt: int,
        checkpoint: BrowserCheckpoint | None = None,
        external_side_effect_possible: bool = False,
    ) -> RecoveryDecision:
        decision: FailureDecision = classify_failure(
            error,
            external_side_effect_possible=external_side_effect_possible,
        )

        if decision.kind.value == "unknown_outcome":
            return RecoveryDecision("reconcile", decision.reason, checkpoint=checkpoint)

        if self.retry_policy.should_retry(decision, attempt):
            return RecoveryDecision(
                "retry",
                decision.reason,
                retry_delay_seconds=self.retry_policy.delay_seconds(attempt),
                checkpoint=checkpoint,
            )

        return RecoveryDecision("stop", decision.reason, checkpoint=checkpoint)

    def validate_resume(
        self,
        checkpoint: BrowserCheckpoint,
        *,
        task_id: str,
        action_count: int,
    ) -> int:
        if not isinstance(checkpoint, BrowserCheckpoint):
            raise TypeError("checkpoint must be a BrowserCheckpoint.")
        if checkpoint.task_id != task_id:
            raise ValueError("Checkpoint belongs to a different task.")
        if isinstance(action_count, bool) or not isinstance(action_count, int) or action_count < 0:
            raise ValueError("action_count must be a non-negative integer.")
        if checkpoint.next_action_index > action_count:
            raise ValueError("Checkpoint index exceeds the available action count.")
        return checkpoint.next_action_index
