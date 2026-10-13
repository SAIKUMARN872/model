from __future__ import annotations

import unittest
from datetime import datetime, timezone

from ai.memory.manager.controller import MemoryController
from ai.memory.manager.manager import MemoryManager
from ai.memory.manager.orchestrator import MemoryOrchestrator
from ai.memory.manager.utils import MemoryContext, MemoryItem


class FakeBackend:
    def __init__(self, name: str = "test") -> None:
        self.name = name
        self.records: dict[tuple[str, str, str], MemoryItem] = {}
        self.counter = 0
        self.fail_write = False
        self.fail_search = False

    def write(self, context, content, *, category, metadata):
        if self.fail_write:
            raise OSError("simulated backend failure")
        self.counter += 1
        memory_id = f"{self.name}-{self.counter}"
        item = MemoryItem(
            memory_id=memory_id,
            backend=self.name,
            content=content,
            category=category,
            score=1.0,
            metadata=metadata,
            created_at=datetime.now(timezone.utc),
        )
        self.records[(context.tenant_id, context.user_id, memory_id)] = item
        return memory_id

    def search(self, context, query, *, limit, category=None):
        if self.fail_search:
            raise OSError("simulated backend failure")
        tokens = set(query.casefold().split())
        found = []
        for (tenant, user, _), item in self.records.items():
            if tenant != context.tenant_id or user != context.user_id:
                continue
            if category is not None and item.category != category:
                continue
            overlap = tokens.intersection(item.content.casefold().split())
            if overlap:
                found.append(
                    MemoryItem(
                        memory_id=item.memory_id,
                        backend=self.name,
                        content=item.content,
                        category=item.category,
                        score=min(1.0, len(overlap) / max(1, len(tokens))),
                        metadata=item.metadata,
                        created_at=item.created_at,
                    )
                )
        return sorted(found, key=lambda item: item.score, reverse=True)[:limit]

    def delete(self, context, memory_id):
        key = (context.tenant_id, context.user_id, memory_id)
        return self.records.pop(key, None) is not None


class MemoryManagerTests(unittest.TestCase):
    def setUp(self):
        self.context = MemoryContext(
            tenant_id="tenant-a",
            user_id="user-a",
            conversation_id="conversation-a",
            request_id="request-a",
        )
        self.backend = FakeBackend()
        self.manager = MemoryManager([self.backend])
        self.controller = MemoryController(self.manager)
        self.orchestrator = MemoryOrchestrator(self.controller)

    def test_remember_and_recall(self):
        saved = self.controller.remember(
            self.context,
            "ModelNow optimizes AI routing",
            category="engineering",
        )
        self.assertTrue(saved.success)
        result = self.controller.recall(
            self.context, "ModelNow AI", category="engineering"
        )
        self.assertEqual(len(result.items), 1)
        self.assertEqual(result.items[0].backend, "test")

    def test_tenant_user_isolation(self):
        self.controller.remember(self.context, "private memory content")
        other_tenant = MemoryContext("tenant-b", "user-a")
        other_user = MemoryContext("tenant-a", "user-b")
        self.assertEqual(self.manager.recall(other_tenant, "private memory"), [])
        self.assertEqual(self.manager.recall(other_user, "private memory"), [])

    def test_backend_registration_and_duplicate_rejection(self):
        with self.assertRaises(ValueError):
            self.manager.register_backend(self.backend)
        self.assertEqual(self.manager.backend_names(), ("test",))
        self.assertTrue(self.manager.unregister_backend("test"))
        self.assertFalse(self.manager.unregister_backend("test"))

    def test_unknown_backend_rejected(self):
        with self.assertRaises(ValueError):
            self.manager.remember(
                self.context, "content", backends=["missing"]
            )

    def test_empty_backend_registry_rejected_for_write(self):
        manager = MemoryManager()
        with self.assertRaises(RuntimeError):
            manager.remember(self.context, "content")

    def test_partial_write_failure_reported(self):
        second = FakeBackend("second")
        second.fail_write = True
        manager = MemoryManager([self.backend, second])
        result = manager.remember(self.context, "resilient write")
        self.assertIn("test", result)
        self.assertIn("_partial_failures", result)

    def test_all_write_failures_raise(self):
        self.backend.fail_write = True
        with self.assertRaises(RuntimeError):
            self.manager.remember(self.context, "unavailable")

    def test_invalid_context_and_limits_rejected(self):
        with self.assertRaises(ValueError):
            MemoryContext("", "user-a")
        with self.assertRaises(ValueError):
            self.manager.recall(self.context, "query", limit=0)

    def test_metadata_validation(self):
        with self.assertRaises(ValueError):
            self.controller.remember(
                self.context, "content", metadata={"bad": float("nan")}
            )

    def test_forget_is_scoped(self):
        saved = self.controller.remember(self.context, "delete this memory")
        memory_id = saved.metadata["backend_memory_ids"]["test"]
        other_user = MemoryContext("tenant-a", "user-b")
        self.assertFalse(self.manager.forget(other_user, memory_id, backend="test"))
        self.assertTrue(self.manager.forget(self.context, memory_id, backend="test"))

    def test_orchestrator_dispatch_and_unknown_arguments(self):
        result = self.orchestrator.execute(
            "remember", self.context, content="orchestrated memory"
        )
        self.assertTrue(result.success)
        recalled = self.orchestrator.execute(
            "recall", self.context, query="orchestrated memory"
        )
        self.assertEqual(len(recalled.items), 1)
        with self.assertRaises(ValueError):
            self.orchestrator.execute("unknown", self.context)
        with self.assertRaises(ValueError):
            self.orchestrator.execute(
                "remember", self.context, content="text", admin=True
            )

    def test_invalid_backend_item_rejected(self):
        class BadBackend(FakeBackend):
            def search(self, context, query, *, limit, category=None):
                return ["not a MemoryItem"]

        manager = MemoryManager([BadBackend("bad")])
        with self.assertRaises(RuntimeError):
            manager.recall(self.context, "query")


if __name__ == "__main__":
    unittest.main(verbosity=2)
