import threading
import unittest
from dataclasses import replace
from datetime import datetime, timedelta, timezone

from .context import WorkingMemoryContext
from .memory import (
    WorkingMemory,
    WorkingMemoryConflictError,
    WorkingMemoryNotFoundError,
)
from .state import WorkingMemoryState


class WorkingMemoryTests(unittest.TestCase):
    def setUp(self):
        self.memory = WorkingMemory(default_ttl_seconds=60)
        self.context = WorkingMemoryContext(
            tenant_id="tenant-a",
            user_id="user-a",
            conversation_id="conversation-a",
            task_id="task-a",
        )

    def test_create_and_get(self):
        state = self.memory.create(self.context, {"step": "plan"})
        self.assertEqual(state.version, 1)
        self.assertEqual(state.data, {"step": "plan"})
        self.assertEqual(self.memory.get(self.context).data, state.data)

    def test_create_empty_state(self):
        state = self.memory.create(self.context)
        self.assertEqual(state.data, {})
        self.assertEqual(state.version, 1)

    def test_duplicate_scope_rejected(self):
        self.memory.create(self.context)
        with self.assertRaises(WorkingMemoryConflictError):
            self.memory.create(self.context)

    def test_merge_preserves_existing_keys(self):
        state = self.memory.create(self.context, {"a": 1, "b": 2})
        updated = self.memory.merge(
            self.context, {"b": 3, "c": 4}, expected_version=state.version
        )
        self.assertEqual(updated.data, {"a": 1, "b": 3, "c": 4})
        self.assertEqual(updated.version, 2)

    def test_replace_removes_old_keys(self):
        state = self.memory.create(self.context, {"old": True})
        updated = self.memory.replace(
            self.context, {"new": True}, expected_version=state.version
        )
        self.assertEqual(updated.data, {"new": True})
        self.assertEqual(updated.version, 2)

    def test_stale_version_rejected(self):
        self.memory.create(self.context, {"a": 1})
        self.memory.merge(self.context, {"b": 2}, expected_version=1)
        with self.assertRaises(WorkingMemoryConflictError):
            self.memory.merge(self.context, {"c": 3}, expected_version=1)

    def test_invalid_expected_version_rejected(self):
        self.memory.create(self.context, {"a": 1})
        for version in (0, -1, True, "1", None):
            with self.subTest(version=version):
                with self.assertRaises(ValueError):
                    self.memory.merge(
                        self.context, {"b": 2}, expected_version=version
                    )

    def test_delete_key(self):
        state = self.memory.create(self.context, {"a": 1, "b": 2})
        updated = self.memory.delete_key(
            self.context, "a", expected_version=state.version
        )
        self.assertEqual(updated.data, {"b": 2})
        self.assertEqual(updated.version, 2)

    def test_delete_missing_key_still_increments_version(self):
        state = self.memory.create(self.context, {"a": 1})
        updated = self.memory.delete_key(
            self.context, "missing", expected_version=state.version
        )
        self.assertEqual(updated.data, {"a": 1})
        self.assertEqual(updated.version, 2)

    def test_clear_is_idempotent(self):
        self.memory.create(self.context)
        self.assertTrue(self.memory.clear(self.context))
        self.assertFalse(self.memory.clear(self.context))

    def test_clear_checks_expected_version(self):
        self.memory.create(self.context)
        with self.assertRaises(WorkingMemoryConflictError):
            self.memory.clear(self.context, expected_version=2)
        self.assertEqual(self.memory.get(self.context).version, 1)

    def test_clear_is_scoped(self):
        other = WorkingMemoryContext("tenant-a", "user-b")
        self.memory.create(self.context, {"secret": "a"})
        self.memory.create(other, {"secret": "b"})
        self.assertTrue(self.memory.clear(self.context))
        self.assertEqual(self.memory.get(other).data, {"secret": "b"})

    def test_tenant_isolation(self):
        other = WorkingMemoryContext(
            tenant_id="tenant-b",
            user_id="user-a",
            conversation_id="conversation-a",
            task_id="task-a",
        )
        self.memory.create(self.context, {"value": "private"})
        with self.assertRaises(WorkingMemoryNotFoundError):
            self.memory.get(other)

    def test_conversation_and_task_are_part_of_scope(self):
        other = WorkingMemoryContext(
            tenant_id="tenant-a",
            user_id="user-a",
            conversation_id="conversation-other",
            task_id="task-other",
        )
        self.memory.create(self.context, {"value": 1})
        with self.assertRaises(WorkingMemoryNotFoundError):
            self.memory.get(other)

    def test_defensive_copy_on_input_and_output(self):
        source = {"nested": {"value": 1}}
        self.memory.create(self.context, source)
        source["nested"]["value"] = 99

        returned = self.memory.get(self.context)
        returned.data["nested"]["value"] = 100

        self.assertEqual(
            self.memory.get(self.context).data["nested"]["value"], 1
        )

    def test_serialization_roundtrip(self):
        state = self.memory.create(self.context, {"x": [1, 2]})
        restored = WorkingMemoryState.from_dict(state.to_dict())
        self.assertEqual(restored.data, state.data)
        self.assertEqual(restored.version, state.version)
        self.assertEqual(restored.context.scope_key, state.context.scope_key)

    def test_invalid_serialization_payload_rejected(self):
        with self.assertRaises(ValueError):
            WorkingMemoryState.from_dict([])
        with self.assertRaises(KeyError):
            WorkingMemoryState.from_dict({"data": {}})

    def test_expired_state_not_found(self):
        memory = WorkingMemory(default_ttl_seconds=1)
        context = WorkingMemoryContext("tenant", "user")
        state = memory.create(context, {"x": 1}, ttl_seconds=1)
        expired = replace(
            state,
            expires_at=datetime.now(timezone.utc) - timedelta(seconds=1),
        )
        memory._states[context.scope_key] = expired

        with self.assertRaises(WorkingMemoryNotFoundError):
            memory.get(context)
        self.assertEqual(memory.count(), 0)

    def test_invalid_context_and_state_rejected(self):
        with self.assertRaises(ValueError):
            WorkingMemoryContext("", "user")
        with self.assertRaises(ValueError):
            self.memory.create(self.context, {"bad": object()})
        with self.assertRaises(ValueError):
            self.memory.create(self.context, {"bad": float("nan")})
        with self.assertRaises(ValueError):
            self.memory.create(self.context, {"": "invalid key"})

    def test_invalid_ttl_rejected(self):
        for ttl in (0, -1, True, 1.5, "10"):
            with self.subTest(ttl=ttl):
                with self.assertRaises(ValueError):
                    self.memory.create(
                        self.context, {}, ttl_seconds=ttl
                    )

    def test_capacity_limit(self):
        memory = WorkingMemory(max_entries=1, default_ttl_seconds=None)
        memory.create(WorkingMemoryContext("tenant", "user"))
        with self.assertRaises(WorkingMemoryConflictError):
            memory.create(WorkingMemoryContext("tenant", "other"))

    def test_invalid_capacity_configuration(self):
        for kwargs in (
            {"max_entries": 0},
            {"max_entries": True},
            {"default_ttl_seconds": 0},
            {"max_ttl_seconds": 0},
            {"default_ttl_seconds": 100, "max_ttl_seconds": 10},
        ):
            with self.subTest(kwargs=kwargs):
                with self.assertRaises(ValueError):
                    WorkingMemory(**kwargs)

    def test_concurrent_updates_allow_only_one_version(self):
        self.memory.create(self.context, {"counter": 0})
        barrier = threading.Barrier(3)
        results = []
        results_lock = threading.Lock()

        def update(value):
            barrier.wait()
            try:
                self.memory.merge(
                    self.context, {"counter": value}, expected_version=1
                )
                result = "success"
            except WorkingMemoryConflictError:
                result = "conflict"
            with results_lock:
                results.append(result)

        threads = [
            threading.Thread(target=update, args=(1,)),
            threading.Thread(target=update, args=(2,)),
        ]
        for thread in threads:
            thread.start()
        barrier.wait()
        for thread in threads:
            thread.join(timeout=5)

        self.assertTrue(all(not thread.is_alive() for thread in threads))
        self.assertCountEqual(results, ["success", "conflict"])
        self.assertEqual(self.memory.get(self.context).version, 2)

    def test_count_and_clear_all(self):
        self.memory.create(self.context)
        self.memory.create(WorkingMemoryContext("tenant-a", "user-b"))
        self.assertEqual(self.memory.count(), 2)
        self.assertEqual(self.memory.clear_all(), 2)
        self.assertEqual(self.memory.count(), 0)


if __name__ == "__main__":
    unittest.main()
