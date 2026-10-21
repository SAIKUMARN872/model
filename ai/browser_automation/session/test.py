import time
import unittest
from concurrent.futures import ThreadPoolExecutor

from .manager import (
    InvalidSessionTransitionError,
    SessionManager,
    SessionNotFoundError,
    SessionOwnershipError,
)
from .state import SessionState


class SessionManagerTests(unittest.TestCase):
    def setUp(self):
        self.manager = SessionManager(default_ttl_seconds=60)
        self.session = self.manager.create_session("user-a", "task-a")

    def test_create_session_starts_created(self):
        self.assertEqual(self.session.state, SessionState.CREATED)
        self.assertEqual(self.session.user_id, "user-a")
        self.assertEqual(self.session.task_id, "task-a")
        self.assertGreater(self.session.expires_at, self.session.created_at)

    def test_user_isolation(self):
        with self.assertRaises(SessionOwnershipError):
            self.manager.get_session(self.session.session_id, "user-b")

    def test_task_isolation(self):
        with self.assertRaises(SessionOwnershipError):
            self.manager.get_session(
                self.session.session_id, "user-a", "task-b"
            )

    def test_unknown_session_is_rejected(self):
        with self.assertRaises(SessionNotFoundError):
            self.manager.get_session("missing", "user-a")

    def test_valid_state_transitions(self):
        active = self.manager.transition(
            self.session.session_id, "user-a", SessionState.ACTIVE
        )
        self.assertEqual(active.state, SessionState.ACTIVE)

        paused = self.manager.transition(
            self.session.session_id, "user-a", SessionState.PAUSED
        )
        self.assertEqual(paused.state, SessionState.PAUSED)

        active = self.manager.transition(
            self.session.session_id, "user-a", SessionState.ACTIVE
        )
        self.assertEqual(active.state, SessionState.ACTIVE)

    def test_invalid_transition_is_rejected(self):
        with self.assertRaises(InvalidSessionTransitionError):
            self.manager.transition(
                self.session.session_id, "user-a", "completed"
            )

    def test_closed_session_is_terminal(self):
        self.manager.close_session(self.session.session_id, "user-a")
        with self.assertRaises(InvalidSessionTransitionError):
            self.manager.transition(
                self.session.session_id, "user-a", SessionState.ACTIVE
            )

    def test_expiration_is_enforced_on_read(self):
        short = self.manager.create_session(
            "user-a", "task-short", ttl_seconds=0.02
        )
        time.sleep(0.04)
        result = self.manager.get_session(short.session_id, "user-a")
        self.assertEqual(result.state, SessionState.EXPIRED)

    def test_expire_sessions_counts_expired_records(self):
        self.manager.create_session("user-a", "task-short", ttl_seconds=0.02)
        time.sleep(0.04)
        self.assertEqual(self.manager.expire_sessions(), 1)

    def test_cleanup_removes_closed_and_expired(self):
        self.manager.close_session(self.session.session_id, "user-a")
        self.manager.create_session("user-a", "task-short", ttl_seconds=0.02)
        time.sleep(0.04)
        self.assertEqual(self.manager.cleanup(), 2)
        self.assertEqual(self.manager.list_sessions("user-a"), [])

    def test_metadata_is_defensively_copied(self):
        original = {"settings": {"safe": True}}
        created = self.manager.create_session(
            "user-a", "task-meta", metadata=original
        )
        original["settings"]["safe"] = False

        result = self.manager.get_session(created.session_id, "user-a")
        self.assertTrue(result.metadata["settings"]["safe"])

        result.metadata["settings"]["safe"] = False
        reread = self.manager.get_session(created.session_id, "user-a")
        self.assertTrue(reread.metadata["settings"]["safe"])

    def test_metadata_update_increments_version(self):
        result = self.manager.update_metadata(
            self.session.session_id, "user-a", {"region": "test"}
        )
        self.assertEqual(result.metadata["region"], "test")
        self.assertEqual(result.version, self.session.version + 1)

    def test_metadata_update_rejected_after_close(self):
        self.manager.close_session(self.session.session_id, "user-a")
        with self.assertRaises(InvalidSessionTransitionError):
            self.manager.update_metadata(
                self.session.session_id, "user-a", {"x": 1}
            )

    def test_list_sessions_only_returns_owner_records(self):
        self.manager.create_session("user-b", "task-b")
        sessions = self.manager.list_sessions("user-a")
        self.assertTrue(sessions)
        self.assertTrue(all(s.user_id == "user-a" for s in sessions))

    def test_concurrent_updates_are_serialized(self):
        def update(index):
            return self.manager.update_metadata(
                self.session.session_id, "user-a", {f"key-{index}": index}
            )

        with ThreadPoolExecutor(max_workers=8) as pool:
            list(pool.map(update, range(20)))

        result = self.manager.get_session(self.session.session_id, "user-a")
        self.assertEqual(len(result.metadata), 20)
        self.assertEqual(result.version, 20)


if __name__ == "__main__":
    unittest.main()
