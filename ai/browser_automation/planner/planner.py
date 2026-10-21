"""Deterministic browser task planner.

This module validates caller-provided actions. It does not use an LLM to
invent actions and does not execute any browser operations.
"""

from __future__ import annotations

import uuid
from typing import Iterable

from ai.browser_automation.models import BrowserAction
from .goals import BrowserGoal
from .tasks import PlannedTask
from .utils import validate_actions


class BrowserTaskPlanner:
    def __init__(self, *, max_actions: int = 30):
        if isinstance(max_actions, bool) or not isinstance(max_actions, int) or max_actions < 1:
            raise ValueError("max_actions must be a positive integer.")
        self.max_actions = max_actions

    def plan(
        self,
        goal: BrowserGoal,
        actions: Iterable[BrowserAction],
        *,
        requires_approval: bool = False,
        notes: Iterable[str] = (),
    ) -> PlannedTask:
        if not isinstance(goal, BrowserGoal):
            raise TypeError("goal must be a BrowserGoal.")

        action_list = list(actions)
        validate_actions(action_list, max_actions=self.max_actions)

        note_list = tuple(str(note)[:500] for note in notes)
        approval_needed = requires_approval or any(
            bool(action.requires_approval) for action in action_list
        )

        return PlannedTask(
            goal=goal.description,
            actions=tuple(action_list),
            plan_id=uuid.uuid4().hex,
            requires_approval=approval_needed,
            notes=note_list,
            metadata={
                "start_url": goal.start_url,
                "success_criteria": list(goal.success_criteria),
                "constraints": list(goal.constraints),
                "action_count": len(action_list),
            },
        )
