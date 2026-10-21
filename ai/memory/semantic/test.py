from __future__ import annotations

import unittest

from ai.memory.semantic.knowledge import SemanticKnowledge
from ai.memory.semantic.memory import SemanticMemory
from ai.memory.semantic.retriever import SemanticRetriever


class SemanticMemoryTests(unittest.TestCase):
    def setUp(self):
        self.memory = SemanticMemory()
        self.retriever = SemanticRetriever(self.memory)

    def add(self, content="ModelNow routes AI requests efficiently", **kwargs):
        values = {
            "tenant_id": "tenant-a",
            "user_id": "user-a",
            "content": content,
        }
        values.update(kwargs)
        return self.memory.add(**values)

    def test_add_get_roundtrip(self):
        record = self.add(metadata={"source": "test"}, confidence=0.9)
        loaded = self.memory.get("tenant-a", "user-a", record.knowledge_id)
        self.assertIsNotNone(loaded)
        self.assertEqual(loaded.content, record.content)
        self.assertEqual(loaded.confidence, 0.9)

    def test_tenant_and_user_isolation(self):
        record = self.add()
        self.assertIsNone(self.memory.get("tenant-b", "user-a", record.knowledge_id))
        self.assertIsNone(self.memory.get("tenant-a", "user-b", record.knowledge_id))
        self.assertEqual(self.memory.list("tenant-b", "user-a"), [])

    def test_deduplication_is_scoped(self):
        first = self.add("ModelNow routes AI requests")
        second = self.add("ModelNow routes AI requests")
        self.assertEqual(first.knowledge_id, second.knowledge_id)
        other = self.add(
            "ModelNow routes AI requests", tenant_id="tenant-b"
        )
        self.assertNotEqual(first.knowledge_id, other.knowledge_id)

    def test_update_and_optimistic_version(self):
        record = self.add()
        updated = self.memory.update(
            "tenant-a", "user-a", record.knowledge_id,
            expected_version=1,
            content="ModelNow improves AI routing quality",
            metadata={"reviewed": True},
        )
        self.assertEqual(updated.version, 2)
        self.assertTrue(updated.metadata["reviewed"])
        with self.assertRaises(ValueError):
            self.memory.update(
                "tenant-a", "user-a", record.knowledge_id,
                expected_version=1, content="stale update",
            )

    def test_duplicate_update_rejected_without_losing_original(self):
        first = self.add("ModelNow routing knowledge")
        second = self.add("ModelNow memory knowledge", deduplicate=False)
        with self.assertRaises(ValueError):
            self.memory.update(
                "tenant-a", "user-a", second.knowledge_id,
                expected_version=1, content=first.content,
                category=first.category,
            )
        self.assertIsNotNone(
            self.memory.get("tenant-a", "user-a", second.knowledge_id)
        )

    def test_archive_restore(self):
        record = self.add()
        archived = self.memory.archive(
            "tenant-a", "user-a", record.knowledge_id, expected_version=1
        )
        self.assertTrue(archived.archived)
        self.assertEqual(self.memory.list("tenant-a", "user-a"), [])
        restored = self.memory.restore(
            "tenant-a", "user-a", record.knowledge_id,
            expected_version=archived.version,
        )
        self.assertFalse(restored.archived)
        self.assertEqual(len(self.memory.list("tenant-a", "user-a")), 1)

    def test_search_ranks_relevant_knowledge(self):
        self.add("Weekend meal planning", confidence=0.8)
        relevant = self.add(
            "ModelNow AI routing reduces inference cost",
            confidence=0.95,
        )
        results = self.retriever.search(
            "tenant-a", "user-a", "ModelNow AI routing"
        )
        self.assertTrue(results)
        self.assertEqual(results[0].knowledge.knowledge_id, relevant.knowledge_id)

    def test_category_filter(self):
        self.add("Routing design", category="engineering")
        self.add("Holiday plan", category="personal")
        records = self.memory.list(
            "tenant-a", "user-a", category="engineering"
        )
        self.assertEqual(len(records), 1)

    def test_delete_is_idempotent(self):
        record = self.add()
        self.assertTrue(self.memory.delete("tenant-a", "user-a", record.knowledge_id))
        self.assertFalse(self.memory.delete("tenant-a", "user-a", record.knowledge_id))

    def test_validation(self):
        with self.assertRaises(ValueError):
            self.add("   ")
        with self.assertRaises(ValueError):
            self.add("valid content", confidence=1.5)
        with self.assertRaises(ValueError):
            self.memory.list("tenant-a", "user-a", include_archived="yes")
        with self.assertRaises(ValueError):
            self.retriever.search("tenant-a", "user-a", "query", limit=0)

    def test_metadata_is_defensively_copied(self):
        metadata = {"nested": {"value": 1}}
        record = self.add(metadata=metadata)
        metadata["nested"]["value"] = 99
        loaded = self.memory.get("tenant-a", "user-a", record.knowledge_id)
        self.assertEqual(loaded.metadata["nested"]["value"], 1)

    def test_serialization_roundtrip(self):
        record = self.add()
        restored = SemanticKnowledge.from_dict(record.to_dict())
        self.assertEqual(restored.knowledge_id, record.knowledge_id)
        self.assertEqual(restored.created_at, record.created_at)


if __name__ == "__main__":
    unittest.main(verbosity=2)
