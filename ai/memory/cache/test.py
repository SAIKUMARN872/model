"""Tests for ModelNow memory cache implementations."""

from __future__ import annotations

import unittest

from ..exceptions import MemorySerializationError, MemoryValidationError
from .cache import TTLMemoryCache
from .redis_cache import RedisMemoryCache
from .ttl import normalize_ttl
from .utils import namespaced_key


class FakeClock:
    def __init__(self) -> None:
        self.value = 100.0

    def __call__(self) -> float:
        return self.value

    def advance(self, seconds: float) -> None:
        self.value += seconds


class FakeRedis:
    def __init__(self) -> None:
        self.data: dict[str, str] = {}

    def get(self, key: str):
        return self.data.get(key)

    def set(self, key: str, value: str, **kwargs):
        self.data[key] = value
        return True

    def delete(self, *keys: str):
        removed = 0
        for key in keys:
            if key in self.data:
                del self.data[key]
                removed += 1
        return removed

    def scan_iter(self, match: str, count: int = 500):
        prefix = match[:-1]
        return iter(key for key in list(self.data) if key.startswith(prefix))


class TTLCacheTests(unittest.TestCase):
    def setUp(self) -> None:
        self.clock = FakeClock()
        self.cache = TTLMemoryCache(
            max_entries=2,
            default_ttl_seconds=10,
            clock=self.clock,
        )

    def test_set_get_and_defensive_copy(self) -> None:
        original = {"items": ["one"]}
        self.cache.set("a", original)
        original["items"].append("caller mutation")
        result = self.cache.get("a")
        self.assertEqual(result, {"items": ["one"]})
        result["items"].append("reader mutation")
        self.assertEqual(self.cache.get("a"), {"items": ["one"]})

    def test_expiration(self) -> None:
        self.cache.set("a", "value", ttl_seconds=2)
        self.clock.advance(2)
        self.assertIsNone(self.cache.get("a"))
        self.assertEqual(self.cache.stats()["expirations"], 1)

    def test_lru_eviction(self) -> None:
        self.cache.set("a", 1)
        self.cache.set("b", 2)
        self.assertEqual(self.cache.get("a"), 1)
        self.cache.set("c", 3)
        self.assertIsNone(self.cache.get("b"))
        self.assertEqual(self.cache.get("a"), 1)
        self.assertEqual(self.cache.stats()["evictions"], 1)

    def test_zero_ttl_does_not_retain(self) -> None:
        self.cache.set("a", "value", ttl_seconds=0)
        self.assertIsNone(self.cache.get("a"))

    def test_delete_and_clear(self) -> None:
        self.cache.set("a", 1)
        self.assertTrue(self.cache.delete("a"))
        self.assertFalse(self.cache.delete("a"))
        self.cache.set("b", 2)
        self.cache.clear()
        self.assertEqual(self.cache.stats()["entries"], 0)

    def test_invalid_ttl_and_key(self) -> None:
        with self.assertRaises(MemoryValidationError):
            self.cache.set("a", 1, ttl_seconds=-1)
        with self.assertRaises(MemoryValidationError):
            self.cache.get("   ")
        with self.assertRaises(MemoryValidationError):
            normalize_ttl(float("inf"))

    def test_max_entries_is_enforced(self) -> None:
        with self.assertRaises(MemoryValidationError):
            TTLMemoryCache(max_entries=0)


class RedisCacheTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = FakeRedis()
        self.cache = RedisMemoryCache(
            self.client,
            prefix="test-memory",
            default_ttl_seconds=30,
        )

    def test_json_round_trip(self) -> None:
        self.cache.set("record-1", {"content": "hello", "score": 0.9})
        self.assertEqual(
            self.cache.get("record-1"),
            {"content": "hello", "score": 0.9},
        )

    def test_delete_and_prefix_clear(self) -> None:
        self.cache.set("one", 1)
        other = RedisMemoryCache(self.client, prefix="other")
        other.set("two", 2)
        self.assertTrue(self.cache.delete("one"))
        self.cache.set("three", 3)
        self.cache.clear()
        self.assertIsNone(self.cache.get("three"))
        self.assertEqual(other.get("two"), 2)

    def test_rejects_non_json_value(self) -> None:
        with self.assertRaises(MemorySerializationError):
            self.cache.set("bad", object())

    def test_rejects_non_finite_json_number(self) -> None:
        with self.assertRaises(MemorySerializationError):
            self.cache.set("bad-number", float("nan"))

    def test_requires_exactly_one_backend(self) -> None:
        with self.assertRaises(MemoryValidationError):
            RedisMemoryCache()

    def test_namespace_key_is_stable_and_separated(self) -> None:
        first = namespaced_key("conversation", "user:123")
        second = namespaced_key("session", "user:123")
        self.assertEqual(first, namespaced_key("conversation", "user:123"))
        self.assertNotEqual(first, second)
        self.assertTrue(first.startswith("modelnow:conversation:"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
