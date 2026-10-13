import unittest
from datetime import timedelta

from .context import SessionContext
from .manager import (
    SessionConflictError,
    SessionManager,
    SessionNotFoundError,
)
from .session import SessionRecord, SessionStatus
from .utils import utc_now


class SessionMemoryTests(unittest.TestCase):
    def setUp(self):
        self.manager = SessionManager(default_ttl_seconds=None)
        self.record = self.manager.create(
            "tenant-a", "user-a", "ModelNow chat",
            context={"topic": "routing"},
        )

    def test_create_and_get(self):
        result = self.manager.get("tenant-a", "user-a", self.record.session_id)
        self.assertEqual(result.session_id, self.record.session_id)
        self.assertEqual(result.context["topic"], "routing")

    def test_tenant_user_isolation(self):
        with self.assertRaises(SessionNotFoundError):
            self.manager.get("tenant-b", "user-a", self.record.session_id)
        with self.assertRaises(SessionNotFoundError):
            self.manager.get("tenant-a", "user-b", self.record.session_id)

    def test_update_and_version(self):
        result = self.manager.update(
            "tenant-a", "user-a", self.record.session_id,
            expected_version=1,
            name="Updated chat",
            context_updates={"intent": "help"},
        )
        self.assertEqual(result.version, 2)
        self.assertEqual(result.context["intent"], "help")
        with self.assertRaises(SessionConflictError):
            self.manager.update(
                "tenant-a", "user-a", self.record.session_id,
                expected_version=1,
                name="Stale update",
            )

    def test_close_and_update_rejected(self):
        closed = self.manager.close(
            "tenant-a", "user-a", self.record.session_id,
            expected_version=1,
        )
        self.assertEqual(closed.status, SessionStatus.CLOSED)
        with self.assertRaises(SessionConflictError):
            self.manager.update(
                "tenant-a", "user-a", self.record.session_id,
                expected_version=closed.version,
                name="Not allowed",
            )

    def test_close_is_idempotent(self):
        first = self.manager.close(
            "tenant-a", "user-a", self.record.session_id
        )
        second = self.manager.close(
            "tenant-a", "user-a", self.record.session_id
        )
        self.assertEqual(first.version, second.version)

    def test_delete_is_idempotent(self):
        self.assertTrue(
            self.manager.delete("tenant-a", "user-a", self.record.session_id)
        )
        self.assertFalse(
            self.manager.delete("tenant-a", "user-a", self.record.session_id)
        )

    def test_expiration(self):
        now = utc_now()
        expired = SessionRecord(
            session_id="expired-session",
            tenant_id="tenant-a",
            user_id="user-a",
            name="Expired",
            created_at=now - timedelta(minutes=10),
            updated_at=now - timedelta(minutes=10),
            expires_at=now - timedelta(seconds=1),
        )
        self.manager._records[
            ("tenant-a", "user-a", expired.session_id)
        ] = expired

        result = self.manager.get("tenant-a", "user-a", expired.session_id)
        self.assertEqual(result.status, SessionStatus.EXPIRED)

    def test_list_scope_and_closed_filter(self):
        self.manager.create("tenant-a", "user-b", "Other user")
        self.manager.close("tenant-a", "user-a", self.record.session_id)

        active = self.manager.list_sessions("tenant-a", "user-a")
        all_sessions = self.manager.list_sessions(
            "tenant-a", "user-a", include_closed=True
        )
        self.assertEqual(active, [])
        self.assertEqual(len(all_sessions), 1)

    def test_session_limit(self):
        manager = SessionManager(default_ttl_seconds=None, max_sessions_per_user=1)
        manager.create("tenant-a", "user-a")
        with self.assertRaises(SessionConflictError):
            manager.create("tenant-a", "user-a")

    def test_context_merge_and_remove(self):
        merged = SessionContext.merge({"a": 1}, {"b": 2})
        self.assertEqual(merged, {"a": 1, "b": 2})
        removed = SessionContext.remove(merged, "a")
        self.assertEqual(removed, {"b": 2})
        self.assertEqual(merged, {"a": 1, "b": 2})

    def test_serialization_roundtrip(self):
        restored = SessionRecord.from_dict(self.record.to_dict())
        self.assertEqual(restored.session_id, self.record.session_id)
        self.assertEqual(restored.context, self.record.context)

    def test_invalid_inputs(self):
        with self.assertRaises(ValueError):
            self.manager.create("tenant-a", "user-a", "")
        with self.assertRaises(ValueError):
            SessionManager(default_ttl_seconds=0)
        with self.assertRaises(ValueError):
            self.manager.list_sessions("tenant-a", "user-a", limit=0)
        with self.assertRaises(ValueError):
            SessionContext.merge({}, {"bad": object()})


if __name__ == "__main__":
    unittest.main(verbosity=2)
