import os
import tempfile
import unittest

from ai.memory.storage import (
    MemoryDatabase,
    MemoryVersionConflictError,
    SQLiteMemoryStorage,
    SQLiteVectorStore,
)


class RealMemoryIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory(prefix="modelnow_memory_")
        self.db_path = os.path.join(self.temp_dir.name, "integration.db")
        self.database = MemoryDatabase(self.db_path)
        self.storage = SQLiteMemoryStorage(self.database)
        self.vectors = SQLiteVectorStore(self.database)

    def tearDown(self):
        self.database.close()
        self.temp_dir.cleanup()

    def test_real_database_persists_after_reopen(self):
        saved = self.storage.save(
            "tenant-a",
            "user-a",
            "ModelNow memory survives database reopening.",
            memory_id="persistent-001",
            metadata={"source": "integration-test"},
        )
        self.assertEqual(saved["version"], 1)

        self.database.close()
        self.database = MemoryDatabase(self.db_path)
        self.storage = SQLiteMemoryStorage(self.database)
        self.vectors = SQLiteVectorStore(self.database)

        loaded = self.storage.get("tenant-a", "user-a", "persistent-001")
        self.assertIsNotNone(loaded)
        self.assertEqual(
            loaded["content"],
            "ModelNow memory survives database reopening.",
        )
        self.assertEqual(loaded["metadata"]["source"], "integration-test")
        self.assertEqual(loaded["version"], 1)

    def test_tenant_and_user_isolation(self):
        self.storage.save(
            "tenant-a", "user-a", "Private A", memory_id="scope-001"
        )

        self.assertIsNone(
            self.storage.get("tenant-b", "user-a", "scope-001")
        )
        self.assertIsNone(
            self.storage.get("tenant-a", "user-b", "scope-001")
        )

        tenant_b_results = self.storage.search("tenant-b", "user-a")
        user_b_results = self.storage.search("tenant-a", "user-b")
        self.assertEqual(tenant_b_results, [])
        self.assertEqual(user_b_results, [])

    def test_update_and_stale_version_conflict(self):
        record = self.storage.save(
            "tenant-a", "user-a", "Original", memory_id="update-001"
        )

        updated = self.storage.update(
            "tenant-a",
            "user-a",
            "update-001",
            expected_version=record["version"],
            content="Updated",
            metadata={"reviewed": True},
        )
        self.assertEqual(updated["content"], "Updated")
        self.assertEqual(updated["version"], 2)
        self.assertTrue(updated["metadata"]["reviewed"])

        with self.assertRaises(MemoryVersionConflictError):
            self.storage.update(
                "tenant-a",
                "user-a",
                "update-001",
                expected_version=1,
                content="Stale write",
            )

        latest = self.storage.get("tenant-a", "user-a", "update-001")
        self.assertEqual(latest["content"], "Updated")
        self.assertEqual(latest["version"], 2)

    def test_vector_persistence_and_parent_cascade_delete(self):
        self.storage.save(
            "tenant-a", "user-a", "Vector-backed memory",
            memory_id="vector-001",
        )
        vector = self.vectors.upsert(
            "tenant-a",
            "user-a",
            "vector-001",
            [0.1, 0.2, 0.3],
            embedding_model="test-embedding-model",
            metadata={"kind": "integration"},
        )
        self.assertEqual(vector["dimensions"], 3)

        loaded = self.vectors.get("tenant-a", "user-a", "vector-001")
        self.assertEqual(loaded["vector"], [0.1, 0.2, 0.3])

        deleted = self.storage.delete("tenant-a", "user-a", "vector-001")
        self.assertTrue(deleted)
        self.assertIsNone(
            self.vectors.get("tenant-a", "user-a", "vector-001")
        )

    def test_duplicate_id_is_scoped_to_tenant_and_user(self):
        self.storage.save(
            "tenant-a", "user-a", "First", memory_id="duplicate-001"
        )

        # The same memory ID is valid for a different user scope.
        second = self.storage.save(
            "tenant-a", "user-b", "Second", memory_id="duplicate-001"
        )
        self.assertEqual(second["user_id"], "user-b")

    def test_search_filters_memory_type(self):
        self.storage.save(
            "tenant-a", "user-a", "Semantic content",
            memory_id="type-001", memory_type="semantic",
        )
        self.storage.save(
            "tenant-a", "user-a", "Episodic content",
            memory_id="type-002", memory_type="episodic",
        )

        results = self.storage.search(
            "tenant-a", "user-a", memory_type="semantic"
        )
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["memory_id"], "type-001")

    def test_database_health(self):
        self.assertTrue(self.database.health_check())


if __name__ == "__main__":
    unittest.main(verbosity=2)
