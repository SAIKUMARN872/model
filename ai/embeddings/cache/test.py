"""Embedding cache unit tests and optional Redis integration tests."""

import os
import unittest

from ai.embeddings.cache import (
    EmbeddingCache,
    MemoryEmbeddingCache,
    RedisEmbeddingCache,
    make_cache_key,
    serialize_embedding,
    deserialize_embedding,
)
from ai.embeddings.exceptions import EmbeddingProviderError


class CacheUtilityTests(unittest.TestCase):
    def test_deterministic_and_isolated_keys(self):
        first = make_cache_key("model-a", "hello")
        self.assertEqual(first, make_cache_key("model-a", "hello"))
        self.assertNotEqual(first, make_cache_key("model-b", "hello"))
        self.assertNotEqual(first, make_cache_key("model-a", "hello", normalize=False))
        self.assertNotEqual(first, make_cache_key("model-a", "Hello"))

    def test_serialization_round_trip(self):
        vector = [0.25, -0.5, 1.0]
        self.assertEqual(
            deserialize_embedding(serialize_embedding(vector)),
            vector,
        )

    def test_invalid_serialization_rejected(self):
        for payload in ("not-json", "{}", '{"schema_version":99,"embedding":[1]}'):
            with self.subTest(payload=payload):
                with self.assertRaises(ValueError):
                    deserialize_embedding(payload)

    def test_non_finite_values_rejected(self):
        for vector in ([float("nan")], [float("inf")], [True], []):
            with self.subTest(vector=vector):
                with self.assertRaises(ValueError):
                    serialize_embedding(vector)


class MemoryCacheTests(unittest.TestCase):
    def test_lru_eviction_and_stats(self):
        cache = MemoryEmbeddingCache(max_entries=2, ttl_seconds=60)
        cache.set("a", [1.0, 2.0])
        cache.set("b", [3.0, 4.0])
        self.assertEqual(cache.get("a"), [1.0, 2.0])
        cache.set("c", [5.0, 6.0])
        self.assertIsNone(cache.get("b"))
        self.assertEqual(cache.stats().evictions, 1)
        cache.close()

    def test_returned_vectors_are_isolated(self):
        cache = MemoryEmbeddingCache()
        original = [1.0, 2.0]
        cache.set("vector", original)
        original[0] = 99.0
        returned = cache.get("vector")
        self.assertEqual(returned, [1.0, 2.0])
        returned[0] = 77.0
        self.assertEqual(cache.get("vector"), [1.0, 2.0])

    def test_ttl_validation(self):
        with self.assertRaises(ValueError):
            MemoryEmbeddingCache(ttl_seconds=0)
        cache = MemoryEmbeddingCache(ttl_seconds=60)
        with self.assertRaises(ValueError):
            cache.set("key", [1.0], ttl_seconds=0)


class CacheFacadeTests(unittest.TestCase):
    def test_cache_hit_avoids_recomputation(self):
        with EmbeddingCache() as cache:
            calls = []
            def compute():
                calls.append(1)
                return [0.1, 0.2, 0.3]

            first = cache.get_or_compute(
                "model-a", "text", compute, dimensions=3
            )
            second = cache.get_or_compute(
                "model-a", "text", compute, dimensions=3
            )
            self.assertEqual(first, second)
            self.assertEqual(len(calls), 1)

    def test_model_isolation_and_delete(self):
        cache = EmbeddingCache()
        cache.set("model-a", "text", [1.0, 2.0], dimensions=2)
        self.assertEqual(cache.get("model-a", "text", dimensions=2), [1.0, 2.0])
        self.assertIsNone(cache.get("model-b", "text", dimensions=2))
        self.assertTrue(cache.delete("model-a", "text", dimensions=2))
        self.assertIsNone(cache.get("model-a", "text", dimensions=2))
        cache.close()

    def test_invalid_dimension_rejected(self):
        cache = EmbeddingCache()
        with self.assertRaises(ValueError):
            cache.set("model", "text", [1.0, 2.0], dimensions=3)
        cache.close()

    def test_unknown_backend_rejected(self):
        with self.assertRaises(ValueError):
            EmbeddingCache(backend="unknown")

    def test_fail_closed_on_backend_failure(self):
        cache = EmbeddingCache(fail_open=False)
        def fail(*args, **kwargs):
            raise OSError("simulated cache outage")
        cache._backend.get = fail
        with self.assertRaises(EmbeddingProviderError):
            cache.get("model", "text")
        cache.close()


class RedisIntegrationTests(unittest.TestCase):
    @unittest.skipUnless(
        os.environ.get("MODELNOW_RUN_REDIS_CACHE_TESTS") == "1",
        "Set MODELNOW_RUN_REDIS_CACHE_TESTS=1 to test against live Redis",
    )
    def test_real_redis_round_trip(self):
        cache = RedisEmbeddingCache()
        key = "integration-test-" + os.urandom(8).hex()
        try:
            vector = [0.1, 0.2, 0.3]
            self.assertTrue(cache.set(key, vector, ttl_seconds=30))
            self.assertEqual(cache.get(key, expected_dimension=3), vector)
            self.assertTrue(cache.delete(key))
            self.assertIsNone(cache.get(key))
        finally:
            cache.close()


if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromModule(
        __import__(__name__)
    )
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
