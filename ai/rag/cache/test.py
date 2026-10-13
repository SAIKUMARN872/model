"""Automated tests for the ModelNow RAG cache."""

import asyncio
import unittest

from ai.rag.cache.cache import InMemoryCache
from ai.rag.cache.ttl import TTLPolicy, expiration_time, is_expired
from ai.rag.cache.utils import (
    deserialize_json,
    make_cache_key,
    serialize_json,
)


class TTLTests(unittest.TestCase):
    def test_default_ttl(self):
        policy = TTLPolicy()
        self.assertEqual(policy.resolve(), 300.0)

    def test_reject_invalid_ttl(self):
        policy = TTLPolicy()
        for value in (0, -1, float("inf"), True):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    policy.resolve(value)

    def test_expiration_helpers(self):
        deadline = expiration_time(5.0, now=10.0)
        self.assertEqual(deadline, 15.0)
        self.assertFalse(is_expired(deadline, now=14.9))
        self.assertTrue(is_expired(deadline, now=15.0))


class CacheUtilityTests(unittest.TestCase):
    def test_deterministic_cache_key(self):
        first = make_cache_key("rag", {"query": "hello", "top_k": 5})
        second = make_cache_key("rag", {"top_k": 5, "query": "hello"})
        self.assertEqual(first, second)

    def test_namespace_and_version_separate_keys(self):
        first = make_cache_key("rag", "hello", version="v1")
        second = make_cache_key("rag", "hello", version="v2")
        self.assertNotEqual(first, second)

    def test_json_round_trip(self):
        value = {"answer": "hello", "sources": ["doc-1"], "score": 0.9}
        self.assertEqual(deserialize_json(serialize_json(value)), value)

    def test_reject_non_json_values(self):
        with self.assertRaises(ValueError):
            serialize_json({"invalid": object()})


class InMemoryCacheTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.cache = InMemoryCache(
            max_entries=2,
            default_ttl_seconds=1.0,
            max_ttl_seconds=10.0,
        )

    async def test_set_and_get(self):
        await self.cache.set("answer", {"text": "RAG"})
        self.assertEqual(await self.cache.get("answer"), {"text": "RAG"})

    async def test_missing_key(self):
        self.assertIsNone(await self.cache.get("missing"))

    async def test_ttl_expiration(self):
        await self.cache.set("short", "value", ttl_seconds=0.02)
        await asyncio.sleep(0.05)
        self.assertIsNone(await self.cache.get("short"))

    async def test_lru_eviction(self):
        await self.cache.set("a", 1)
        await self.cache.set("b", 2)
        await self.cache.get("a")
        await self.cache.set("c", 3)

        self.assertEqual(await self.cache.get("a"), 1)
        self.assertIsNone(await self.cache.get("b"))
        self.assertEqual(await self.cache.get("c"), 3)

    async def test_defensive_copy(self):
        original = {"items": [1, 2]}
        await self.cache.set("copy", original)
        original["items"].append(3)

        retrieved = await self.cache.get("copy")
        self.assertEqual(retrieved, {"items": [1, 2]})

        retrieved["items"].append(4)
        self.assertEqual(
            await self.cache.get("copy"),
            {"items": [1, 2]},
        )

    async def test_delete(self):
        await self.cache.set("delete-me", "value")
        self.assertTrue(await self.cache.delete("delete-me"))
        self.assertFalse(await self.cache.delete("delete-me"))

    async def test_clear(self):
        await self.cache.set("a", 1)
        await self.cache.set("b", 2)
        await self.cache.clear()

        self.assertIsNone(await self.cache.get("a"))
        self.assertIsNone(await self.cache.get("b"))

    async def test_stats(self):
        await self.cache.set("a", 1)
        await self.cache.get("a")
        await self.cache.get("missing")

        stats = await self.cache.stats()
        self.assertEqual(stats.hits, 1)
        self.assertEqual(stats.misses, 1)
        self.assertEqual(stats.writes, 1)

    async def test_invalid_key_and_ttl(self):
        with self.assertRaises(ValueError):
            await self.cache.get(" ")

        with self.assertRaises(ValueError):
            await self.cache.set("a", 1, ttl_seconds=0)

    async def test_concurrent_writes(self):
        await asyncio.gather(
            *(self.cache.set(f"key-{i}", i) for i in range(20))
        )

        stats = await self.cache.stats()
        self.assertEqual(stats.writes, 20)
        self.assertLessEqual(stats.entries, 2)


if __name__ == "__main__":
    unittest.main(verbosity=2)
