"""Checkpoint models for safely resuming browser tasks."""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any


@dataclass
class BrowserCheckpoint:
    task_id: str
    completed_action_ids: list[str] = field(default_factory=list)
    next_action_index: int = 0
    state: dict[str, Any] = field(default_factory=dict)
    checkpoint_id: str = field(default_factory=lambda: uuid.uuid4().hex)
    created_at: float = field(default_factory=time.time)

    def __post_init__(self) -> None:
        if not isinstance(self.task_id, str) or not self.task_id.strip():
            raise ValueError("task_id must be non-empty.")
        if isinstance(self.next_action_index, bool) or not isinstance(self.next_action_index, int) or self.next_action_index < 0:
            raise ValueError("next_action_index must be a non-negative integer.")
        if not isinstance(self.completed_action_ids, list):
            raise TypeError("completed_action_ids must be a list.")
        if not isinstance(self.state, dict):
            raise TypeError("state must be a dictionary.")

    def to_dict(self) -> dict[str, Any]:
        return {
            "checkpoint_id": self.checkpoint_id,
            "task_id": self.task_id,
            "completed_action_ids": list(self.completed_action_ids),
            "next_action_index": self.next_action_index,
            "state": dict(self.state),
            "created_at": self.created_at,
        }
