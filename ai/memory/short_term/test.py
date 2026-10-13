import unittest
from datetime import timedelta

from .buffer import ShortTermBuffer
from .manager import ShortTermMemoryManager
from .memory import ShortTermMemory
from .utils import utc_now


class ShortTermMemoryTests(unittest.TestCase):
    def setUp(self):
        self.manager = ShortTermMemoryManager(default_ttl_seconds=None)
        self.item = self.manager.remember(
            "tenant-a", "user-a", "ModelNow routing context",
            metadata={"source": "test"},
        )

    def test_remember_recall(self):
        results = self.manager.recall("tenant-a", "user-a", query="routing")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].memory_id, self.item.memory_id)

    def test_tenant_user_isolation(self):
        self.assertEqual(self.manager.recall("tenant-b", "user-a"), [])
        self.assertEqual(self.manager.recall("tenant-a", "user-b"), [])

    def test_delete_is_idempotent(self):
        self.assertTrue(self.manager.forget("tenant-a", "user-a", self.item.memory_id))
        self.assertFalse(self.manager.forget("tenant-a", "user-a", self.item.memory_id))

    def test_clear_is_scoped(self):
        self.manager.remember("tenant-a", "user-b", "Other user")
        self.assertEqual(self.manager.clear("tenant-a", "user-a"), 1)
        self.assertEqual(len(self.manager.recall("tenant-a", "user-b")), 1)

    def test_category_filter(self):
        self.manager.remember("tenant-a", "user-a", "Another memory", category="task")
        results = self.manager.recall("tenant-a", "user-a", category="task")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].category, "task")

    def test_capacity_eviction(self):
        buffer = ShortTermBuffer(max_items=2, default_ttl_seconds=None)
        first = buffer.add("t", "u", "first", memory_id="first")
        buffer.add("t", "u", "second", memory_id="second")
        buffer.add("t", "u", "third", memory_id="third")
        self.assertIsNone(buffer.get("t", "u", first.memory_id))
        self.assertEqual(buffer.stats("t", "u")["evictions"], 1)

    def test_expiration(self):
        now = utc_now()
        item = ShortTermMemory(
            memory_id="expired",
            tenant_id="tenant-a",
            user_id="user-a",
            content="Expired content",
            created_at=now - timedelta(minutes=2),
            expires_at=now - timedelta(seconds=1),
        )
        buffer = ShortTermBuffer(default_ttl_seconds=None)
        buffer._items[("tenant-a", "user-a", item.memory_id)] = item
        self.assertIsNone(buffer.get("tenant-a", "user-a", item.memory_id))

    def test_duplicate_id_rejected(self):
        with self.assertRaises(ValueError):
            self.manager.buffer.add(
                "tenant-a", "user-a", "duplicate",
                memory_id=self.item.memory_id,
            )

    def test_metadata_is_defensively_copied(self):
        metadata = {"nested": {"x": 1}}
        item = self.manager.remember("t", "u", "metadata test", metadata=metadata)
        metadata["nested"]["x"] = 2
        self.assertEqual(item.metadata["nested"]["x"], 1)

    def test_validation(self):
        with self.assertRaises(ValueError):
            self.manager.remember("t", "u", "")
        with self.assertRaises(ValueError):
            ShortTermMemoryManager(max_items=0)
        with self.assertRaises(ValueError):
            self.manager.recall("t", "u", limit=0)

    def test_serialization_roundtrip(self):
        restored = ShortTermMemory.from_dict(self.item.to_dict())
        self.assertEqual(restored.memory_id, self.item.memory_id)
        self.assertEqual(restored.content, self.item.content)


if __name__ == "__main__":
    unittest.main(verbosity=2)
