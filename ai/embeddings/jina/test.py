"""Offline unit tests for the Jina embedding provider."""

import math
import unittest

from ai.embeddings.jina import (
    JinaEmbeddingClient,
    JinaEmbeddingProvider,
    JinaProviderConfig,
    prepare_documents,
    prepare_queries,
    validate_batch_size,
    validate_vector,
)


class FakeModel:
    max_seq_length = 128

    def __init__(self, dimension=3):
        self.dimension = dimension
        self.calls = []

    def get_sentence_embedding_dimension(self):
        return self.dimension

    def encode(
        self,
        texts,
        batch_size=32,
        normalize_embeddings=True,
        convert_to_numpy=True,
        show_progress_bar=False,
    ):
        self.calls.append(list(texts))
        vectors = []
        for text in texts:
            base = [float(len(text)), 2.0, 3.0][:self.dimension]
            if normalize_embeddings:
                norm = math.sqrt(sum(value * value for value in base))
                base = [value / norm for value in base]
            vectors.append(base)
        return vectors


class JinaEmbeddingTests(unittest.TestCase):
    def setUp(self):
        self.model = FakeModel()
        self.provider = JinaEmbeddingProvider(model=self.model)

    def test_embed_batch(self):
        vectors = self.provider.embed_texts(["hello", "world"])
        self.assertEqual(len(vectors), 2)
        self.assertEqual(len(vectors[0]), 3)

    def test_normalized_vectors(self):
        vectors = self.provider.embed_texts(["hello"])
        self.assertAlmostEqual(sum(x * x for x in vectors[0]), 1.0, places=6)

    def test_disable_normalization(self):
        vector = self.provider.embed_texts(
            ["hello"], normalize_embeddings=False
        )[0]
        self.assertEqual(vector, [5.0, 2.0, 3.0])

    def test_embed_query(self):
        self.assertEqual(len(self.provider.embed_query("question")), 3)

    def test_embed_queries(self):
        self.assertEqual(len(self.provider.embed_queries(["one", "two"])), 2)

    def test_empty_batch(self):
        self.assertEqual(self.provider.embed_texts([]), [])

    def test_empty_query_batch(self):
        self.assertEqual(self.provider.embed_queries([]), [])

    def test_reject_blank_text(self):
        with self.assertRaises(ValueError):
            self.provider.embed_texts(["  "])

    def test_reject_non_string(self):
        with self.assertRaises(TypeError):
            self.provider.embed_texts(["ok", 42])

    def test_reject_string_as_batch(self):
        with self.assertRaises(TypeError):
            self.provider.embed_texts("not a list")

    def test_batch_size_validation(self):
        self.assertEqual(validate_batch_size(8), 8)
        with self.assertRaises(ValueError):
            validate_batch_size(0)
        with self.assertRaises(TypeError):
            validate_batch_size(True)

    def test_vector_dimension_validation(self):
        with self.assertRaises(ValueError):
            validate_vector([1, 2], expected_dimension=3)

    def test_reject_non_finite_vector(self):
        with self.assertRaises(ValueError):
            validate_vector([1.0, float("nan")])

    def test_invalid_config_type(self):
        with self.assertRaises(TypeError):
            JinaEmbeddingProvider(config={})

    def test_config_validation(self):
        with self.assertRaises(ValueError):
            JinaEmbeddingProvider(
                config=JinaProviderConfig(batch_size=0)
            )

    def test_configured_sequence_limit(self):
        provider = JinaEmbeddingProvider(
            config=JinaProviderConfig(max_sequence_length=1024),
            model=self.model,
        )
        self.assertEqual(self.model.max_seq_length, 1024)
        provider.close()

    def test_provider_close(self):
        self.provider.close()
        with self.assertRaises(RuntimeError):
            self.provider.embed_query("question")

    def test_client_wrapper(self):
        client = JinaEmbeddingClient(self.provider)
        self.assertEqual(len(client.embed_query("hello")), 3)

    def test_query_and_document_preparation(self):
        self.assertEqual(prepare_queries(["  query  "]), ["query"])
        self.assertEqual(prepare_documents(["  document  "]), ["document"])

    def test_model_dimension(self):
        self.assertEqual(self.provider.dimension, 3)


if __name__ == "__main__":
    unittest.main(verbosity=2)
