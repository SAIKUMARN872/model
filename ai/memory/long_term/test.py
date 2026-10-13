from __future__ import annotations

import unittest
from dataclasses import replace

from ai.memory.long_term.memory import LongTermMemory
from ai.memory.long_term.storage import InMemoryLongTermMemoryStore
from ai.memory.long_term.utils import LongTermMemoryRecord


class LongTermMemoryTests(unittest.TestCase):
    def setUp(self) -> None:
        self.store = InMemoryLongTermMemoryStore()
        self.memory = LongTermMemory(self.store)

    def save(self, content: str = "ModelNow optimizes AI routing costs", **kwargs):
        values = {
            "tenant_id": "tenant-a",
            "user_id": "user-a",
            "content": content,
        }
        values.update(kwargs)
        return self.memory.save(**values)

    def test_save_get_roundtrip(self):
        record = self.save(importance=0.9, metadata={"source": "test"})
        loaded = self.memory.get("tenant-a", "user-a", record.memory_id)
        self.assertIsNotNone(loaded)
        self.assertEqual(loaded.content, record.content)
        self.assertEqual(loaded.metadata["source"], "test")
        self.assertEqual(loaded.version, 1)

    def test_tenant_and_user_isolation(self):
        record = self.save()
        self.assertIsNone(self.memory.get("tenant-b", "user-a", record.memory_id))
        self.assertIsNone(self.memory.get("tenant-a", "user-b", record.memory_id))
        self.assertEqual(self.memory.list("tenant-b", "user-a"), [])

    def test_update_version_and_metadata_merge(self):
        record = self.save(metadata={"a": 1, "b": 2})
        updated = self.memory.update(
            "tenant-a", "user-a", record.memory_id,
            expected_version=1, content="Updated ModelNow memory",
            metadata={"b": 3, "c": 4},
        )
        self.assertEqual(updated.version, 2)
        self.assertEqual(updated.metadata, {"a": 1, "b": 3, "c": 4})
        self.assertEqual(updated.content, "Updated ModelNow memory")

    def test_stale_update_rejected(self):
        record = self.save()
        self.memory.update(
            "tenant-a", "user-a", record.memory_id,
            expected_version=1, content="first update",
        )
        with self.assertRaises(ValueError):
            self.memory.update(
                "tenant-a", "user-a", record.memory_id,
                expected_version=1, content="stale update",
            )

    def test_archive_and_restore(self):
        record = self.save()
        archived = self.memory.archive(
            "tenant-a", "user-a", record.memory_id, expected_version=1
        )
        self.assertTrue(archived.archived)
        self.assertEqual(self.memory.list("tenant-a", "user-a"), [])
        restored = self.memory.restore(
            "tenant-a", "user-a", record.memory_id,
            expected_version=archived.version,
        )
        self.assertFalse(restored.archived)
        self.assertEqual(len(self.memory.list("tenant-a", "user-a")), 1)

    def test_search_prefers_relevant_important_memory(self):
        self.save("Unrelated weekend plans", importance=0.1)
        relevant = self.save(
            "ModelNow automatic AI model routing reduces inference cost",
            importance=0.9,
        )
        results = self.memory.search(
            "tenant-a", "user-a", "ModelNow AI model routing cost"
        )
        self.assertTrue(results)
        self.assertEqual(results[0].record.memory_id, relevant.memory_id)

    def test_category_filter(self):
        self.save("ModelNow architecture notes", category="engineering")
        self.save("Meeting reminder", category="personal")
        records = self.memory.list(
            "tenant-a", "user-a", category="engineering"
        )
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0].category, "engineering")

    def test_delete_is_idempotent(self):
        record = self.save()
        self.assertTrue(self.memory.delete("tenant-a", "user-a", record.memory_id))
        self.assertFalse(self.memory.delete("tenant-a", "user-a", record.memory_id))

    def test_invalid_importance_and_content_rejected(self):
        with self.assertRaises(ValueError):
            self.save(importance=1.5)
        with self.assertRaises(ValueError):
            self.save("   ")

    def test_invalid_query_and_limits_rejected(self):
        with self.assertRaises(ValueError):
            self.memory.search("tenant-a", "user-a", "   ")
        with self.assertRaises(ValueError):
            self.memory.list("tenant-a", "user-a", limit=0)

    def test_metadata_is_json_safe_and_defensively_serialized(self):
        source = {"nested": {"value": 1}}
        record = self.save(metadata=source)
        source["nested"]["value"] = 99
        loaded = self.memory.get("tenant-a", "user-a", record.memory_id)
        self.assertEqual(loaded.metadata["nested"]["value"], 1)
        with self.assertRaises(ValueError):
            self.save(metadata={"bad": float("nan")})

    def test_storage_rejects_invalid_include_archived(self):
        with self.assertRaises(ValueError):
            self.store.list_records(
                "tenant-a", "user-a", include_archived="yes"
            )

    def test_new_record_version_must_be_one(self):
        record = self.save()
        invalid = replace(
            record,
            memory_id="new-record-with-invalid-version",
            version=2,
        )
        with self.assertRaises(ValueError):
            self.store.save(invalid)

    def test_count(self):
        self.save("active record")
        archived = self.save("archived record")
        self.memory.archive(
            "tenant-a", "user-a", archived.memory_id, expected_version=1
        )
        self.assertEqual(self.memory.count("tenant-a", "user-a"), 2)
        self.assertEqual(
            self.memory.count("tenant-a", "user-a", include_archived=False), 1
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
