"""Offline tests for the embedding registry, factory, and manager."""

import unittest

from ai.embeddings.manager import (
    EmbeddingManager,
    EmbeddingProviderFactory,
    EmbeddingProviderRegistry,
)


class FakeProvider:
    def __init__(self, dimension=3, marker="fake"):
        self.dimension = dimension
        self.marker = marker
        self.closed = False

    def embed_texts(self, texts, **kwargs):
        return [[float(len(text)), 2.0, 3.0][:self.dimension] for text in texts]

    def embed_query(self, query):
        return self.embed_texts([query])[0]

    def close(self):
        self.closed = True


class EmbeddingManagerTests(unittest.TestCase):
    def setUp(self):
        self.registry = EmbeddingProviderRegistry()
        self.factory = EmbeddingProviderFactory(self.registry)
        self.manager = EmbeddingManager(self.registry, self.factory)
        self.registry.register("fake", FakeProvider)

    def tearDown(self):
        self.manager.close()

    def test_register_and_lookup_factory(self):
        self.assertTrue(self.registry.contains("FAKE"))
        self.assertIs(self.registry.get("fake"), FakeProvider)

    def test_duplicate_factory_rejected(self):
        with self.assertRaises(ValueError):
            self.registry.register("fake", FakeProvider)

    def test_factory_replace(self):
        replacement = lambda **kwargs: FakeProvider(marker="replacement")
        self.registry.register("fake", replacement, replace=True)
        self.assertEqual(self.factory.create("fake").marker, "replacement")

    def test_unknown_factory_rejected(self):
        with self.assertRaises(KeyError):
            self.factory.create("missing")

    def test_factory_config(self):
        provider = self.factory.create("fake", {"dimension": 3, "marker": "configured"})
        self.assertEqual(provider.marker, "configured")

    def test_duplicate_config_rejected(self):
        with self.assertRaises(ValueError):
            self.factory.create("fake", {"dimension": 3}, dimension=4)

    def test_invalid_factory_result(self):
        self.registry.register("bad", lambda: object())
        with self.assertRaises(RuntimeError):
            self.factory.create("bad")

    def test_add_and_get_provider(self):
        provider = FakeProvider()
        self.manager.add_provider("primary", provider)
        self.assertIs(self.manager.get_provider("primary"), provider)

    def test_duplicate_provider_rejected(self):
        self.manager.add_provider("primary", FakeProvider())
        with self.assertRaises(ValueError):
            self.manager.add_provider("primary", FakeProvider())

    def test_create_provider(self):
        provider = self.manager.create_provider("primary", "fake", marker="created")
        self.assertEqual(provider.marker, "created")

    def test_embed_texts(self):
        self.manager.add_provider("primary", FakeProvider())
        result = self.manager.embed_texts("primary", ["hello", "world"])
        self.assertEqual(len(result), 2)
        self.assertEqual(len(result[0]), 3)

    def test_embed_query(self):
        self.manager.add_provider("primary", FakeProvider())
        self.assertEqual(len(self.manager.embed_query("primary", "hello")), 3)

    def test_empty_text_batch(self):
        self.manager.add_provider("primary", FakeProvider())
        self.assertEqual(self.manager.embed_texts("primary", []), [])

    def test_invalid_text_batch(self):
        with self.assertRaises(ValueError):
            self.manager.embed_texts("primary", [" "])

    def test_provider_wrong_result_count(self):
        class BadProvider:
            def embed_texts(self, texts):
                return []

        self.manager.add_provider("bad", BadProvider())
        with self.assertRaises(ValueError):
            self.manager.embed_texts("bad", ["hello"])

    def test_remove_provider_closes(self):
        provider = FakeProvider()
        self.manager.add_provider("primary", provider)
        self.assertTrue(self.manager.remove_provider("primary"))
        self.assertTrue(provider.closed)
        self.assertFalse(self.manager.remove_provider("primary"))

    def test_replace_provider_closes_previous(self):
        previous = FakeProvider()
        self.manager.add_provider("primary", previous)
        self.manager.add_provider("primary", FakeProvider(), replace=True)
        self.assertTrue(previous.closed)

    def test_provider_names(self):
        self.manager.add_provider("beta", FakeProvider())
        self.manager.add_provider("alpha", FakeProvider())
        self.assertEqual(self.manager.provider_names(), ("alpha", "beta"))

    def test_close_and_reject_operations(self):
        self.manager.add_provider("primary", FakeProvider())
        self.manager.close()
        with self.assertRaises(RuntimeError):
            self.manager.provider_names()

    def test_registry_unregister(self):
        self.assertTrue(self.registry.unregister("fake"))
        self.assertFalse(self.registry.unregister("fake"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
