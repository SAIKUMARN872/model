import math
import unittest

from ai.embeddings.nomic import (
    NomicConfig,
    NomicEmbeddingClient,
    NomicEmbeddingProvider,
    normalize_vector,
    validate_dimension,
    validate_task,
    validate_texts,
    validate_vectors,
)


class FakeNomicModel:
    def __init__(self, dimension=3):
        self.dimension = dimension
        self.calls = []
        self.closed = False
        self.max_seq_length = 512

    def get_sentence_embedding_dimension(self):
        return self.dimension

    def encode(self, texts, **kwargs):
        self.calls.append((list(texts), kwargs))
        return [[3.0, 4.0, 0.0] for _ in texts]

    def close(self):
        self.closed = True


class NomicEmbeddingTests(unittest.TestCase):
    def setUp(self):
        self.model = FakeNomicModel()
        self.provider = NomicEmbeddingProvider(
            NomicConfig(batch_size=2),
            model=self.model,
        )

    def tearDown(self):
        self.provider.close()

    def test_default_config(self):
        config = NomicConfig()
        self.assertEqual(config.model_name, "nomic-ai/nomic-embed-text-v1.5")
        self.assertEqual(config.dimension, None)
        self.assertEqual(config.batch_size, 32)

    def test_model_dimension_detected(self):
        self.assertEqual(self.provider.dimension, 3)
        self.assertEqual(self.provider.model_info.dimension, 3)

    def test_document_prefix(self):
        self.provider.embed_documents(["hello"], normalize=False)
        self.assertEqual(self.model.calls[-1][0], ["search_document: hello"])

    def test_query_prefix(self):
        self.provider.embed_query("where is the answer", normalize=False)
        self.assertEqual(
            self.model.calls[-1][0],
            ["search_query: where is the answer"],
        )

    def test_normalization(self):
        vector = self.provider.embed_query("hello")
        self.assertAlmostEqual(math.sqrt(sum(x * x for x in vector)), 1.0)

    def test_normalization_can_be_disabled(self):
        vector = self.provider.embed_query("hello", normalize=False)
        self.assertEqual(vector, [3.0, 4.0, 0.0])

    def test_batch_embedding(self):
        vectors = self.provider.embed_documents(["one", "two", "three"])
        self.assertEqual(len(vectors), 3)
        self.assertEqual(len(self.model.calls), 2)

    def test_empty_batch(self):
        self.assertEqual(self.provider.embed_documents([]), [])
        self.assertEqual(self.model.calls, [])

    def test_invalid_text_type(self):
        with self.assertRaises(TypeError):
            self.provider.embed_documents(["valid", 3])

    def test_blank_text(self):
        with self.assertRaises(ValueError):
            self.provider.embed_query("  ")

    def test_invalid_task(self):
        with self.assertRaises(ValueError):
            validate_task("unsupported")

    def test_task_type(self):
        with self.assertRaises(TypeError):
            validate_task(5)

    def test_invalid_dimension(self):
        with self.assertRaises(ValueError):
            validate_dimension(32)

    def test_dimension_type(self):
        with self.assertRaises(TypeError):
            validate_dimension(True)

    def test_wrong_vector_count(self):
        with self.assertRaises(ValueError):
            validate_vectors([[1.0, 2.0]], expected_count=2)

    def test_wrong_vector_dimension(self):
        with self.assertRaises(ValueError):
            validate_vectors([[1.0, 2.0]], 1, expected_dimension=3)

    def test_zero_vector_normalization(self):
        with self.assertRaises(ValueError):
            normalize_vector([0.0, 0.0])

    def test_config_validation(self):
        with self.assertRaises(ValueError):
            NomicEmbeddingProvider(NomicConfig(batch_size=0))

    def test_closed_provider_rejects_inference(self):
        self.provider.close()
        with self.assertRaises(RuntimeError):
            self.provider.embed_query("hello")

    def test_close_model(self):
        self.provider.close()
        self.assertTrue(self.model.closed)

    def test_client_wrapper(self):
        client_model = FakeNomicModel()
        client = NomicEmbeddingClient(model=client_model)
        vector = client.embed_query("test")
        self.assertEqual(len(vector), 3)
        client.close()
        self.assertTrue(client_model.closed)


if __name__ == "__main__":
    unittest.main(verbosity=2)
