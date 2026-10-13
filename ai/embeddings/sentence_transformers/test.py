import math
import unittest

from ai.embeddings.sentence_transformers import (
    SentenceTransformerClient,
    SentenceTransformerConfig,
    SentenceTransformerProvider,
    l2_normalize,
    validate_batch_size,
    validate_dimension,
    validate_texts,
)


class FakeSentenceTransformer:
    def __init__(self, dimension=3):
        self.dimension = dimension
        self.calls = []
        self.closed = False
        self.max_seq_length = 128

    def get_sentence_embedding_dimension(self):
        return self.dimension

    def encode(self, texts, **kwargs):
        self.calls.append((list(texts), kwargs))
        return [[3.0, 4.0, 0.0] for _ in texts]

    def close(self):
        self.closed = True


class SentenceTransformerTests(unittest.TestCase):
    def setUp(self):
        self.model = FakeSentenceTransformer()
        self.provider = SentenceTransformerProvider(
            SentenceTransformerConfig(batch_size=2),
            model=self.model,
        )

    def tearDown(self):
        self.provider.close()

    def test_default_model(self):
        self.assertEqual(
            SentenceTransformerConfig().model_name,
            "sentence-transformers/all-MiniLM-L6-v2",
        )

    def test_lazy_loading(self):
        provider = SentenceTransformerProvider()
        try:
            self.assertFalse(provider.is_loaded)
        finally:
            provider.close()

    def test_dimension_detection(self):
        self.assertEqual(self.provider.dimension, 3)

    def test_batch_embedding(self):
        vectors = self.provider.embed(["one", "two", "three"])
        self.assertEqual(len(vectors), 3)
        self.assertEqual(len(self.model.calls), 2)

    def test_query_embedding(self):
        self.assertEqual(len(self.provider.embed_query("hello")), 3)

    def test_empty_batch(self):
        self.assertEqual(self.provider.embed([]), [])
        self.assertEqual(self.model.calls, [])

    def test_l2_normalization(self):
        vector = self.provider.embed_query("hello")
        self.assertAlmostEqual(math.sqrt(sum(x * x for x in vector)), 1.0)

    def test_normalization_disabled(self):
        self.assertEqual(
            self.provider.embed_query("hello", normalize=False),
            [3.0, 4.0, 0.0],
        )

    def test_invalid_text_type(self):
        with self.assertRaises(TypeError):
            self.provider.embed(["ok", 12])

    def test_empty_text(self):
        with self.assertRaises(ValueError):
            self.provider.embed_query(" ")

    def test_batch_size_validation(self):
        with self.assertRaises(ValueError):
            validate_batch_size(0)

    def test_batch_size_type(self):
        with self.assertRaises(TypeError):
            validate_batch_size(True)

    def test_dimension_validation(self):
        with self.assertRaises(ValueError):
            validate_dimension(0)

    def test_text_sequence_validation(self):
        with self.assertRaises(TypeError):
            validate_texts("not a batch")

    def test_config_type(self):
        with self.assertRaises(TypeError):
            SentenceTransformerProvider({})

    def test_config_batch_validation(self):
        with self.assertRaises(ValueError):
            SentenceTransformerProvider(SentenceTransformerConfig(batch_size=0))

    def test_inconsistent_output_count(self):
        class BadCountModel(FakeSentenceTransformer):
            def encode(self, texts, **kwargs):
                return [[1.0, 2.0, 3.0]]

        provider = SentenceTransformerProvider(model=BadCountModel())
        try:
            with self.assertRaises(ValueError):
                provider.embed(["one", "two"])
        finally:
            provider.close()

    def test_dimension_mismatch(self):
        with self.assertRaisesRegex(ValueError, "does not match configured dimension"):
            SentenceTransformerProvider(
                SentenceTransformerConfig(dimension=4),
                model=FakeSentenceTransformer(dimension=3),
            )

    def test_non_finite_output(self):
        class BadModel(FakeSentenceTransformer):
            def encode(self, texts, **kwargs):
                return [[float("nan"), 1.0, 2.0] for _ in texts]

        provider = SentenceTransformerProvider(model=BadModel())
        try:
            with self.assertRaises(ValueError):
                provider.embed(["hello"])
        finally:
            provider.close()

    def test_zero_vector_rejected(self):
        with self.assertRaises(ValueError):
            l2_normalize([0.0, 0.0])

    def test_close_model(self):
        self.provider.close()
        self.assertTrue(self.model.closed)

    def test_closed_provider_rejects_inference(self):
        self.provider.close()
        with self.assertRaises(RuntimeError):
            self.provider.embed_query("hello")

    def test_client(self):
        model = FakeSentenceTransformer()
        client = SentenceTransformerClient(model=model)
        self.assertEqual(len(client.embed_query("hello")), 3)
        client.close()
        self.assertTrue(model.closed)


if __name__ == "__main__":
    unittest.main(verbosity=2)

