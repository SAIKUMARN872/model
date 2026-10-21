"""Tests for episodic memory."""
import unittest
from datetime import datetime, timedelta, timezone

from ai.memory.exceptions import MemoryConflictError, MemoryValidationError
from ai.memory.episodic.events import EpisodicEvent
from ai.memory.episodic.memory import EpisodicMemory
from ai.memory.episodic.timeline import EpisodicTimeline


class EpisodicMemoryTests(unittest.TestCase):
    def setUp(self):
        self.store = EpisodicMemory()
        self.now = datetime(2026, 1, 1, tzinfo=timezone.utc)

    def event(self, content="signed in", **kwargs):
        values = {
            "tenant_id": "tenant-a",
            "user_id": "user-a",
            "event_type": "user.login",
            "content": content,
            "occurred_at": self.now,
        }
        values.update(kwargs)
        return EpisodicEvent(**values)

    def test_record_get_roundtrip(self):
        event = self.store.record(self.event())
        self.assertEqual(self.store.get("tenant-a", "user-a", event.event_id), event)
        self.assertEqual(EpisodicEvent.from_dict(event.to_dict()), event)

    def test_tenant_and_user_isolation(self):
        event = self.store.record(self.event())
        self.assertIsNone(self.store.get("tenant-b", "user-a", event.event_id))
        self.assertIsNone(self.store.get("tenant-a", "user-b", event.event_id))
        self.assertEqual(self.store.count("tenant-b", "user-a"), 0)

    def test_idempotency_key(self):
        first = self.store.record(self.event(), idempotency_key="request-1")
        second = self.store.record(
            self.event("retry"), idempotency_key="request-1"
        )
        self.assertEqual(first.event_id, second.event_id)
        self.assertEqual(self.store.count("tenant-a", "user-a"), 1)

    def test_duplicate_id_conflict(self):
        event = self.event()
        self.store.record(event)
        with self.assertRaises(MemoryConflictError):
            self.store.record(EpisodicEvent(
                tenant_id=event.tenant_id, user_id=event.user_id,
                event_type=event.event_type, content="different",
                occurred_at=event.occurred_at, event_id=event.event_id,
            ))

    def test_newest_first(self):
        self.store.record(self.event(
            "old", occurred_at=self.now - timedelta(days=1)
        ))
        self.store.record(self.event(
            "new", occurred_at=self.now + timedelta(days=1)
        ))
        result = self.store.query("tenant-a", "user-a")
        self.assertEqual([e.content for e in result], ["new", "old"])

    def test_filters(self):
        self.store.record(self.event("login", importance=0.3))
        self.store.record(self.event(
            "purchase", event_type="commerce.purchase", importance=0.9,
            occurred_at=self.now + timedelta(hours=1),
        ))
        result = self.store.query(
            "tenant-a", "user-a", event_types={"commerce.purchase"},
            min_importance=0.8, start=self.now,
        )
        self.assertEqual([e.content for e in result], ["purchase"])

    def test_invalid_query(self):
        with self.assertRaises(MemoryValidationError):
            self.store.query("tenant-a", "user-a", limit=0)
        with self.assertRaises(MemoryValidationError):
            self.store.query(
                "tenant-a", "user-a",
                start=self.now + timedelta(days=1), end=self.now,
            )

    def test_delete_is_idempotent(self):
        event = self.store.record(self.event(), idempotency_key="request")
        self.assertTrue(self.store.delete("tenant-a", "user-a", event.event_id))
        self.assertFalse(self.store.delete("tenant-a", "user-a", event.event_id))
        self.assertEqual(self.store.count("tenant-a", "user-a"), 0)

    def test_timeline_pagination(self):
        for day in range(4):
            self.store.record(self.event(
                str(day), occurred_at=self.now + timedelta(days=day)
            ))
        timeline = EpisodicTimeline(self.store)
        first = timeline.page("tenant-a", "user-a", limit=2)
        self.assertEqual([e.content for e in first.events], ["3", "2"])
        self.assertTrue(first.has_more)
        second = timeline.page(
            "tenant-a", "user-a", limit=2, before=first.next_before
        )
        self.assertEqual([e.content for e in second.events], ["1", "0"])
        self.assertFalse(second.has_more)

    def test_validation(self):
        with self.assertRaises(MemoryValidationError):
            self.event(event_type="INVALID TYPE")
        with self.assertRaises(MemoryValidationError):
            self.event(content=" ")
        with self.assertRaises(MemoryValidationError):
            self.event(importance=1.5)
        with self.assertRaises(MemoryValidationError):
            self.event(occurred_at=datetime(2026, 1, 1))

    def test_metadata_is_copied(self):
        metadata = {"source": {"name": "test"}}
        event = self.event(metadata=metadata)
        metadata["source"]["name"] = "changed"
        self.assertEqual(event.metadata["source"]["name"], "test")


if __name__ == "__main__":
    unittest.main(verbosity=2)

