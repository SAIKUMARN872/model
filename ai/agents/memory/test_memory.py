"""Unit tests for agent memory components."""

import unittest

from .context import MemoryContext
from .history import ConversationHistory
from .memory_manager import MemoryManager
from .utils import normalize_memory_key, validate_text


class MemoryUtilityTests(unittest.TestCase):
    def test_normalizes_key(self):
        self.assertEqual(normalize_memory_key(" Favorite Color "), "favorite_color")

    def test_rejects_invalid_key(self):
        with self.assertRaises(ValueError):
            normalize_memory_key("../secret")

    def test_rejects_blank_text(self):
        with self.assertRaises(ValueError):
            validate_text("   ")

    def test_context_metadata_is_independent(self):
        source = {"labels": ["a"]}
        context = MemoryContext(user_id="u1", metadata=source)
        source["labels"].append("b")
        self.assertEqual(context.metadata, {"labels": ["a"]})


class MemoryManagerTests(unittest.TestCase):
    def setUp(self):
        self.manager = MemoryManager()
        self.context = MemoryContext(
            user_id="user-1",
            session_id="session-1",
            conversation_id="conversation-1",
        )

    def test_store_and_retrieve(self):
        record = self.manager.store("favorite color", "blue", self.context)
        self.assertEqual(record.key, "favorite_color")
        self.assertEqual(
            self.manager.get_value("favorite color", self.context), "blue"
        )

    def test_upsert_preserves_creation_time(self):
        first = self.manager.store("theme", "dark", self.context)
        second = self.manager.store("theme", "light", self.context)
        self.assertEqual(first.created_at, second.created_at)
        self.assertEqual(
            self.manager.get_value("theme", self.context), "light"
        )

    def test_memories_are_scope_isolated(self):
        self.manager.store("plan", "private", self.context)
        other = MemoryContext(user_id="user-2")
        self.assertIsNone(self.manager.retrieve("plan", other))

    def test_delete(self):
        self.manager.store("key", "value", self.context)
        self.assertTrue(self.manager.delete("key", self.context))
        self.assertFalse(self.manager.delete("key", self.context))

    def test_list_and_clear(self):
        self.manager.store("one", 1, self.context)
        self.manager.store("two", 2, self.context)
        self.assertEqual(len(self.manager.list_memories(self.context)), 2)
        self.assertEqual(self.manager.clear(self.context), 2)
        self.assertEqual(self.manager.list_memories(self.context), [])

    def test_rejects_none_value(self):
        with self.assertRaises(ValueError):
            self.manager.store("key", None, self.context)


class ConversationHistoryTests(unittest.TestCase):
    def test_add_and_get_messages(self):
        history = ConversationHistory()
        context = MemoryContext(user_id="u1", conversation_id="c1")
        history.add(context, "user", "Hello")
        history.add(context, "assistant", "Hi")
        self.assertEqual(
            [m.content for m in history.get(context)], ["Hello", "Hi"]
        )

    def test_history_limit(self):
        history = ConversationHistory(max_messages=2)
        context = MemoryContext(conversation_id="c1")
        history.add(context, "user", "one")
        history.add(context, "user", "two")
        history.add(context, "user", "three")
        self.assertEqual(
            [m.content for m in history.get(context)], ["two", "three"]
        )

    def test_get_limit(self):
        history = ConversationHistory()
        context = MemoryContext(conversation_id="c1")
        for value in ("one", "two", "three"):
            history.add(context, "user", value)
        self.assertEqual(
            [m.content for m in history.get(context, limit=1)], ["three"]
        )
        self.assertEqual(history.get(context, limit=0), [])

    def test_clear_history(self):
        history = ConversationHistory()
        context = MemoryContext(conversation_id="c1")
        history.add(context, "user", "Hello")
        self.assertEqual(history.clear(context), 1)
        self.assertEqual(history.get(context), [])

    def test_history_is_scope_isolated(self):
        history = ConversationHistory()
        first = MemoryContext(user_id="u1", conversation_id="c1")
        second = MemoryContext(user_id="u1", conversation_id="c2")
        history.add(first, "user", "private to c1")
        self.assertEqual(history.get(second), [])

    def test_rejects_invalid_max_messages(self):
        with self.assertRaises(ValueError):
            ConversationHistory(max_messages=0)


if __name__ == "__main__":
    unittest.main()
