import tempfile
import unittest
from pathlib import Path

from ai.memory.manager.manager import MemoryManager
from ai.memory.manager.sqlite_backend import SQLiteMemoryBackend
from ai.memory.manager.utils import MemoryContext
from ai.memory.storage.database import MemoryDatabase
from ai.memory.storage.storage import SQLiteMemoryStorage


class SQLiteMemoryBackendIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = str(Path(self.temp_dir.name) / "memory.db")
        self.database = MemoryDatabase(database_path=self.db_path)
        self.storage = SQLiteMemoryStorage(self.database)
        self.backend = SQLiteMemoryBackend(self.storage)
        self.manager = MemoryManager([self.backend])
        self.context = MemoryContext(
            tenant_id="tenant-a", user_id="user-a"
        )

    def tearDown(self):
        self.database.close()
        self.temp_dir.cleanup()

    def test_remember_and_recall(self):
        ids = self.manager.remember(
            self.context,
            "ModelNow routes AI requests by cost and quality",
            category="architecture",
            metadata={"source": "integration-test"},
        )
        self.assertIn("sqlite", ids)

        items = self.manager.recall(
            self.context, "routes AI requests", limit=10
        )
        self.assertEqual(len(items), 1)
        self.assertEqual(
            items[0].content,
            "ModelNow routes AI requests by cost and quality",
        )
        self.assertEqual(items[0].category, "architecture")
        self.assertEqual(
            items[0].metadata, {"source": "integration-test"}
        )

    def test_category_filter(self):
        self.manager.remember(
            self.context, "Python service design",
            category="engineering", metadata={},
        )
        self.manager.remember(
            self.context, "Pricing strategy",
            category="business", metadata={},
        )

        items = self.manager.recall(
            self.context, "strategy",
            limit=10, category="business",
        )
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].category, "business")

    def test_tenant_and_user_isolation(self):
        self.manager.remember(
            self.context, "private routing configuration",
            category="private", metadata={},
        )
        other_user = MemoryContext("tenant-a", "user-b")
        other_tenant = MemoryContext("tenant-b", "user-a")

        self.assertEqual(
            self.manager.recall(other_user, "routing", limit=10), []
        )
        self.assertEqual(
            self.manager.recall(other_tenant, "routing", limit=10), []
        )

    def test_forget_deletes_persisted_memory(self):
        ids = self.manager.remember(
            self.context, "remove this memory",
            category="test", metadata={},
        )
        memory_id = ids["sqlite"]

        self.assertTrue(
            self.manager.forget(
                self.context, memory_id, backend="sqlite"
            )
        )
        self.assertIsNone(
            self.storage.get(
                tenant_id="tenant-a",
                user_id="user-a",
                memory_id=memory_id,
            )
        )

    def test_memory_survives_database_reopen(self):
        ids = self.manager.remember(
            self.context, "persistent memory record",
            category="persistence",
            metadata={"verified": True},
        )
        memory_id = ids["sqlite"]

        self.database.close()
        self.database = MemoryDatabase(database_path=self.db_path)
        self.storage = SQLiteMemoryStorage(self.database)
        self.backend = SQLiteMemoryBackend(self.storage)
        self.manager = MemoryManager([self.backend])

        record = self.storage.get(
            tenant_id="tenant-a",
            user_id="user-a",
            memory_id=memory_id,
        )
        self.assertIsNotNone(record)

        items = self.manager.recall(
            self.context, "persistent memory", limit=10
        )
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].metadata, {"verified": True})

    def test_unknown_backend_is_rejected(self):
        with self.assertRaises(ValueError):
            self.manager.forget(
                self.context, "does-not-exist", backend="unknown"
            )


if __name__ == "__main__":
    unittest.main(verbosity=2)
