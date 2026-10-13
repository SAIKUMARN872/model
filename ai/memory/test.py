"""Offline tests for the ModelNow memory engine."""

from __future__ import annotations

import unittest
from datetime import datetime, timedelta, timezone

from .engine import MemoryEngine
from .exceptions import MemoryNotFoundError, MemoryValidationError
from .models import MemoryQuery, MemoryRecord, MemorySearchResult, MemoryType


class FakeMemoryStore:
    """Deterministic in-memory store used only by the offline test suite."""

    def __init__(self):
        self.records: dict[tuple[str, str], MemoryRecord] = {}

    def save(self, record: MemoryRecord) -> MemoryRecord:
        self.records[(record.tenant_id, record.memory_id)] = record
        return record

    def get(self, tenant_id: str, memory_id: str) -> MemoryRecord | None:
        return self.records.get((tenant_id, memory_id))

    def delete(self, tenant_id: str, memory_id: str) -> bool:
        return self.records.pop((tenant_id, memory_id), None) is not None

    def search(self, query: MemoryQuery) -> list[MemorySearchResult]:
        results = []
        for (tenant_id, _), record in self.records.items():
            if tenant_id != query.tenant_id:
                continue
            if query.user_id is not None and record.user_id != query.user_id:
                continue
            if query.query and query.query.casefold() not in record.content.casefold():
                continue
            results.append(MemorySearchResult(record=record, score=0.75))
        return results


class MemoryEngineTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 1, 1, tzinfo=timezone.utc)
        self.store = FakeMemoryStore()
        self.engine = MemoryEngine(
            self.store,
            tenant_id="tenant-a",
            user_id="user-a",
            clock=lambda: self.now,
        )

    def test_create_and_get(self):
        record = self.engine.create("Important project context")
        self.assertEqual(record.tenant_id, "tenant-a")
        self.assertEqual(record.user_id, "user-a")
        self.assertEqual(self.engine.get(record.memory_id).content, record.content)

    def test_update_increments_version_and_merges_metadata(self):
        record = self.engine.create("Initial content", metadata={"origin": "chat"})
        updated = self.engine.update(
            record.memory_id,
            content="Updated content",
            metadata={"topic": "ModelNow"},
        )
        self.assertEqual(updated.version, 2)
        self.assertEqual(updated.content, "Updated content")
        self.assertEqual(updated.metadata, {"origin": "chat", "topic": "ModelNow"})

    def test_update_missing_record_raises(self):
        with self.assertRaises(MemoryNotFoundError):
            self.engine.update("missing", content="value")

    def test_delete_is_idempotent(self):
        record = self.engine.create("Temporary memory")
        self.assertTrue(self.engine.delete(record.memory_id))
        self.assertFalse(self.engine.delete(record.memory_id))

    def test_user_scope_hides_other_users(self):
        other = MemoryRecord(
            tenant_id="tenant-a",
            user_id="user-b",
            content="Private record",
            memory_id="other-user-record",
            created_at=self.now,
            updated_at=self.now,
        )
        self.store.save(other)
        self.assertIsNone(self.engine.get(other.memory_id))
        self.assertFalse(self.engine.delete(other.memory_id))

    def test_tenant_scope_hides_other_tenant(self):
        other = MemoryRecord(
            tenant_id="tenant-b",
            user_id="user-a",
            content="Different tenant",
            memory_id="other-tenant-record",
            created_at=self.now,
            updated_at=self.now,
        )
        self.store.save(other)
        self.assertIsNone(self.engine.get(other.memory_id))

    def test_search_applies_metadata_and_type_filters(self):
        self.engine.create(
            "ModelNow routing context",
            memory_type=MemoryType.SEMANTIC,
            metadata={"area": "routing"},
        )
        self.engine.create(
            "ModelNow conversation note",
            memory_type=MemoryType.CONVERSATION,
            metadata={"area": "chat"},
        )
        results = self.engine.search(
            "ModelNow",
            memory_types=(MemoryType.SEMANTIC,),
            metadata_filters={"area": "routing"},
        )
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].record.memory_type, MemoryType.SEMANTIC)

    def test_expired_records_are_excluded(self):
        expired = self.engine.create(
            "Old context",
            expires_at=self.now + timedelta(seconds=1),
        )
        self.now += timedelta(seconds=2)
        self.assertEqual(self.engine.search("Old context"), [])
        self.assertEqual(len(self.engine.search("Old context", include_expired=True)), 1)

    def test_create_requires_user_scope(self):
        tenant_engine = MemoryEngine(
            self.store,
            tenant_id="tenant-a",
            clock=lambda: self.now,
        )
        with self.assertRaises(MemoryValidationError):
            tenant_engine.create("Unowned memory")

    def test_search_limit_is_validated(self):
        with self.assertRaises(MemoryValidationError):
            self.engine.search("context", limit=0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
