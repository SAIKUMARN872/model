from __future__ import annotations

import unittest

from ..constants import AgentStatus
from ..exceptions import AgentStateError, AgentValidationError
from ..models import AgentContext
from .context import context_snapshot, merge_context
from .state import AgentStateMachine
from .utils import (
    validate_mapping,
    validate_non_empty_string,
    validate_positive_number,
)


class BaseUtilityTests(unittest.TestCase):
    def test_validate_non_empty_string(self) -> None:
        self.assertEqual(validate_non_empty_string(" hello ", "name"), " hello ")

    def test_rejects_blank_string(self) -> None:
        with self.assertRaises(AgentValidationError):
            validate_non_empty_string("  ", "name")

    def test_validate_mapping_returns_copy(self) -> None:
        original = {"key": "value"}
        result = validate_mapping(original, "metadata")
        result["key"] = "changed"
        self.assertEqual(original["key"], "value")

    def test_rejects_invalid_mapping(self) -> None:
        with self.assertRaises(AgentValidationError):
            validate_mapping([], "metadata")

    def test_validate_positive_number(self) -> None:
        self.assertEqual(validate_positive_number(2, "timeout"), 2.0)

    def test_rejects_non_positive_or_non_finite_number(self) -> None:
        for value in (0, -1, float("inf"), float("nan"), True):
            with self.subTest(value=value):
                with self.assertRaises(AgentValidationError):
                    validate_positive_number(value, "timeout")


class AgentContextUtilityTests(unittest.TestCase):
    def test_snapshot_contains_context_fields(self) -> None:
        context = AgentContext(
            user_id="user-1",
            metadata={"source": "test"},
            memory={"topic": "agents"},
            permissions=("read",),
        )

        snapshot = context_snapshot(context)

        self.assertEqual(snapshot["user_id"], "user-1")
        self.assertEqual(snapshot["metadata"], {"source": "test"})
        self.assertEqual(snapshot["memory"], {"topic": "agents"})
        self.assertEqual(snapshot["permissions"], ["read"])

    def test_snapshot_does_not_share_top_level_dictionaries(self) -> None:
        context = AgentContext(metadata={"key": "original"})
        snapshot = context_snapshot(context)
        snapshot["metadata"]["key"] = "changed"
        self.assertEqual(context.metadata["key"], "original")

    def test_merge_context_preserves_original(self) -> None:
        original = AgentContext(
            metadata={"existing": 1},
            memory={"old": True},
            permissions=("read",),
        )

        updated = merge_context(
            original,
            metadata={"added": 2},
            memory={"new": True},
        )

        self.assertEqual(updated.metadata, {"existing": 1, "added": 2})
        self.assertEqual(updated.memory, {"old": True, "new": True})
        self.assertEqual(updated.permissions, ("read",))
        self.assertEqual(original.metadata, {"existing": 1})

    def test_merge_can_explicitly_replace_permissions(self) -> None:
        context = AgentContext(permissions=("read",))
        updated = merge_context(context, permissions=("write",))
        self.assertEqual(updated.permissions, ("write",))
        self.assertEqual(context.permissions, ("read",))

    def test_rejects_invalid_context(self) -> None:
        with self.assertRaises(AgentValidationError):
            context_snapshot({})  # type: ignore[arg-type]


class AgentStateMachineTests(unittest.TestCase):
    def test_valid_lifecycle(self) -> None:
        machine = AgentStateMachine()
        self.assertEqual(machine.transition(AgentStatus.READY), AgentStatus.READY)
        self.assertEqual(machine.transition(AgentStatus.RUNNING), AgentStatus.RUNNING)
        self.assertEqual(machine.transition(AgentStatus.COMPLETED), AgentStatus.COMPLETED)
        self.assertEqual(machine.reset(), AgentStatus.READY)

    def test_rejects_invalid_transition(self) -> None:
        machine = AgentStateMachine()
        with self.assertRaises(AgentStateError):
            machine.transition(AgentStatus.COMPLETED)

    def test_reset_rejects_running_agent(self) -> None:
        machine = AgentStateMachine(AgentStatus.RUNNING)
        with self.assertRaises(AgentStateError):
            machine.reset()

    def test_rejects_invalid_initial_status(self) -> None:
        with self.assertRaises(AgentStateError):
            AgentStateMachine("ready")  # type: ignore[arg-type]


if __name__ == "__main__":
    unittest.main()
