import unittest

from .database import MemoryDatabase
from .storage import (
    MemoryRecordNotFoundError,
    MemoryVersionConflictError,
    SQLiteMemoryStorage,
)
from .vector_store import SQLiteVectorStore


class MemoryStorageTests(unittest.TestCase):
    def setUp(self):
        self.database = MemoryDatabase(":memory:")
        self.database.initialize()
        self.storage = SQLiteMemoryStorage(self.database)
        self.vectors = SQLiteVectorStore(self.database)

    def test_database_health(self):
        self.assertTrue(self.database.health_check())

    def test_save_and_get(self):
        saved = self.storage.save("tenant-a", "user-a", "routing notes")
        loaded = self.storage.get("tenant-a", "user-a", saved["memory_id"])
        self.assertEqual(loaded["content"], "routing notes")
        self.assertEqual(loaded["version"], 1)

    def test_tenant_user_isolation(self):
        saved = self.storage.save("tenant-a", "user-a", "private")
        self.assertIsNone(
            self.storage.get("tenant-b", "user-a", saved["memory_id"])
        )
        self.assertIsNone(
            self.storage.get("tenant-a", "user-b", saved["memory_id"])
        )

    def test_duplicate_id_rejected(self):
        self.storage.save("t", "u", "first", memory_id="same")
        with self.assertRaises(MemoryVersionConflictError):
            self.storage.save("t", "u", "second", memory_id="same")

    def test_update_and_version_conflict(self):
        saved = self.storage.save("t", "u", "first", metadata={"a": 1})
        updated = self.storage.update(
            "t", "u", saved["memory_id"],
            expected_version=1,
            content="second",
            metadata={"b": 2},
        )
        self.assertEqual(updated["version"], 2)
        self.assertEqual(updated["metadata"], {"a": 1, "b": 2})
        with self.assertRaises(MemoryVersionConflictError):
            self.storage.update(
                "t", "u", saved["memory_id"], expected_version=1, content="stale"
            )

    def test_update_missing_record(self):
        with self.assertRaises(MemoryRecordNotFoundError):
            self.storage.update("t", "u", "missing", expected_version=1, content="x")

    def test_search_scope_and_type(self):
        self.storage.save("t", "u", "one", memory_type="semantic")
        self.storage.save("t", "u", "two", memory_type="episodic")
        self.storage.save("t", "other", "three", memory_type="semantic")
        results = self.storage.search("t", "u", memory_type="semantic")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["memory_type"], "semantic")

    def test_delete_is_idempotent(self):
        saved = self.storage.save("t", "u", "remove me")
        memory_id = saved["memory_id"]
        self.assertTrue(self.storage.delete("t", "u", memory_id))
        self.assertFalse(self.storage.delete("t", "u", memory_id))

    def test_expiration_purge(self):
        from datetime import timedelta
        from .utils import utc_now

        expired = self.storage.save(
            "t", "u", "expired",
            expires_at=utc_now() + timedelta(seconds=1),
        )
        # Use an already-expired timestamp by updating the test database row directly.
        with self.database.transaction() as connection:
            connection.execute(
                "UPDATE memory_records SET expires_at = ? WHERE tenant_id = ? AND user_id = ? AND memory_id = ?",
                ("2000-01-01T00:00:00+00:00", "t", "u", expired["memory_id"]),
            )
        self.assertEqual(self.storage.purge_expired("t", "u"), 1)
        self.assertIsNone(self.storage.get("t", "u", expired["memory_id"]))

    def test_vector_roundtrip(self):
        saved = self.storage.save("t", "u", "embedding source")
        vector = self.vectors.upsert(
            "t", "u", saved["memory_id"], [0.1, 0.2, 0.3],
            embedding_model="test-embedding",
        )
        loaded = self.vectors.get("t", "u", saved["memory_id"])
        self.assertEqual(vector["dimensions"], 3)
        self.assertEqual(loaded["vector"], [0.1, 0.2, 0.3])

    def test_vector_requires_parent(self):
        with self.assertRaises(ValueError):
            self.vectors.upsert("t", "u", "missing", [0.1], embedding_model="test")

    def test_vector_validation(self):
        saved = self.storage.save("t", "u", "embedding source")
        with self.assertRaises(ValueError):
            self.vectors.upsert(
                "t", "u", saved["memory_id"], [float("nan")], embedding_model="test"
            )

    def test_validation(self):
        with self.assertRaises(ValueError):
            self.storage.save("t", "u", "")
        with self.assertRaises(ValueError):
            self.storage.search("t", "u", limit=0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
