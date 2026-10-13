from __future__ import annotations

import math
import unittest
from types import SimpleNamespace

from ai.embeddings.voyage import (
    VoyageEmbeddingClient,
    VoyageEmbeddingConfig,
    VoyageEmbeddingProvider,
)


class FakeVoyageClient:
    def __init__(self, dimension: int = 3) -> None:
        self.dimension = dimension
        self.calls: list[dict] = []
        self.closed = False

    def embed(self, **kwargs):
        self.calls.append(kwargs)
        vectors = [
            [float(index + 1)] * self.dimension
            for index, _ in enumerate(kwargs["texts"])
        ]
        return SimpleNamespace(embeddings=vectors)

    def close(self) -> None:
        self.closed = True


class VoyageEmbeddingTests(unittest.TestCase):
    def test_default_model(self):
        self.assertEqual(VoyageEmbeddingConfig().model_name, "voyage-3.5")

    def test_embed_query(self):
        provider = VoyageEmbeddingProvider(client=FakeVoyageClient())
        vector = provider.embed_query("hello")
        self.assertEqual(len(vector), 3)
        self.assertTrue(all(math.isfinite(value) for value in vector))

    def test_embed_documents(self):
        provider = VoyageEmbeddingProvider(client=FakeVoyageClient())
        result = provider.embed_documents(["one", "two"])
        self.assertEqual(len(result), 2)

    def test_batching(self):
        fake = FakeVoyageClient()
        provider = VoyageEmbeddingProvider(
            VoyageEmbeddingConfig(batch_size=2),
            client=fake,
        )
        result = provider.embed_documents(["a", "b", "c"])
        self.assertEqual(len(result), 3)
        self.assertEqual(len(fake.calls), 2)

    def test_input_type_is_passed(self):
        fake = FakeVoyageClient()
        VoyageEmbeddingProvider(client=fake).embed_query("question")
        self.assertEqual(fake.calls[0]["input_type"], "query")

    def test_invalid_input_type(self):
        provider = VoyageEmbeddingProvider(client=FakeVoyageClient())
        with self.assertRaises(ValueError):
            provider.embed(["hello"], input_type="invalid")

    def test_empty_batch(self):
        provider = VoyageEmbeddingProvider(client=FakeVoyageClient())
        self.assertEqual(provider.embed([]), [])

    def test_empty_text(self):
        provider = VoyageEmbeddingProvider(client=FakeVoyageClient())
        with self.assertRaises(ValueError):
            provider.embed([" "])

    def test_invalid_text_type(self):
        provider = VoyageEmbeddingProvider(client=FakeVoyageClient())
        with self.assertRaises(TypeError):
            provider.embed([123])

    def test_dimension_mismatch(self):
        provider = VoyageEmbeddingProvider(
            VoyageEmbeddingConfig(output_dimension=4),
            client=FakeVoyageClient(dimension=3),
        )
        with self.assertRaisesRegex(ValueError, "does not match configured dimension"):
            provider.embed(["hello"])

    def test_normalization(self):
        provider = VoyageEmbeddingProvider(
            VoyageEmbeddingConfig(normalize_embeddings=True),
            client=FakeVoyageClient(),
        )
        vector = provider.embed_query("hello")
        self.assertAlmostEqual(sum(value * value for value in vector) ** 0.5, 1.0)

    def test_close_rejects_inference(self):
        provider = VoyageEmbeddingProvider(client=FakeVoyageClient())
        provider.close()
        with self.assertRaises(RuntimeError):
            provider.embed(["hello"])

    def test_client_wrapper(self):
        client = VoyageEmbeddingClient(client=FakeVoyageClient())
        self.assertEqual(len(client.embed_query("hello")), 3)
        client.close()


if __name__ == "__main__":
    unittest.main()
