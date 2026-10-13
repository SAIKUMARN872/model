from __future__ import annotations

import math
import unittest
from types import SimpleNamespace

from ai.embeddings.openai import (
    OpenAIEmbeddingClient,
    OpenAIEmbeddingConfig,
    OpenAIEmbeddingProvider,
)


class FakeEmbeddings:
    def __init__(self, dimension: int = 3) -> None:
        self.dimension = dimension
        self.calls: list[dict] = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        data = [
            SimpleNamespace(
                index=i,
                embedding=[float(i + 1)] * self.dimension,
            )
            for i, _ in enumerate(kwargs["input"])
        ]
        return SimpleNamespace(data=data)


class FakeClient:
    def __init__(self, dimension: int = 3) -> None:
        self.embeddings = SimpleNamespace(create=FakeEmbeddings(dimension).create)
        self.closed = False

    def close(self) -> None:
        self.closed = True


class OpenAIEmbeddingTests(unittest.TestCase):
    def test_default_model(self):
        self.assertEqual(
            OpenAIEmbeddingConfig().model_name,
            "text-embedding-3-small",
        )

    def test_embed_single(self):
        provider = OpenAIEmbeddingProvider(client=FakeClient())
        vector = provider.embed_query("hello")
        self.assertEqual(len(vector), 3)
        self.assertTrue(all(math.isfinite(x) for x in vector))

    def test_batch_embedding(self):
        provider = OpenAIEmbeddingProvider(
            OpenAIEmbeddingConfig(batch_size=2),
            client=FakeClient(),
        )
        result = provider.embed(["one", "two", "three"])
        self.assertEqual(len(result), 3)

    def test_empty_batch(self):
        provider = OpenAIEmbeddingProvider(client=FakeClient())
        self.assertEqual(provider.embed([]), [])

    def test_invalid_text(self):
        provider = OpenAIEmbeddingProvider(client=FakeClient())
        with self.assertRaises(ValueError):
            provider.embed([" "])

    def test_invalid_text_type(self):
        provider = OpenAIEmbeddingProvider(client=FakeClient())
        with self.assertRaises(TypeError):
            provider.embed([123])

    def test_dimension_mismatch(self):
        provider = OpenAIEmbeddingProvider(
            OpenAIEmbeddingConfig(dimensions=4),
            client=FakeClient(dimension=3),
        )
        with self.assertRaisesRegex(ValueError, "does not match configured dimension"):
            provider.embed(["hello"])

    def test_normalization(self):
        provider = OpenAIEmbeddingProvider(
            OpenAIEmbeddingConfig(normalize_embeddings=True),
            client=FakeClient(),
        )
        vector = provider.embed_query("hello")
        self.assertAlmostEqual(sum(x * x for x in vector) ** 0.5, 1.0)

    def test_close_rejects_inference(self):
        provider = OpenAIEmbeddingProvider(client=FakeClient())
        provider.close()
        with self.assertRaises(RuntimeError):
            provider.embed(["hello"])

    def test_client_wrapper(self):
        client = OpenAIEmbeddingClient(client=FakeClient())
        self.assertEqual(len(client.embed_query("hello")), 3)
        client.close()


if __name__ == "__main__":
    unittest.main()
