import unittest

from ai.embeddings.e5 import (
    E5EmbeddingClient,
    E5EmbeddingProvider,
    E5ModelConfig,
    MODEL_DIMENSIONS,
    prepare_passages,
    prepare_queries,
    validate_embeddings,
)


class FakeModel:
    def __init__(self, dimension=3):
        self.dimension = dimension
        self.max_seq_length = None
        self.calls = []

    def get_sentence_embedding_dimension(self):
        return self.dimension

    def encode(
        self,
        texts,
        batch_size=32,
        show_progress_bar=False,
        convert_to_numpy=True,
        normalize_embeddings=True,
    ):
        self.calls.append(list(texts))
        result = []
        for text in texts:
            if not text.startswith(("query: ", "passage: ")):
                raise AssertionError("E5 prefix missing.")
            vector = [1.0, 1.0, 0.0]
            if normalize_embeddings:
                norm = sum(x * x for x in vector) ** 0.5
                vector = [x / norm for x in vector]
            result.append(vector)
        return result


class E5Tests(unittest.TestCase):
    def test_default_config(self):
        self.assertEqual(E5ModelConfig().model_name, "intfloat/e5-small-v2")

    def test_model_dimensions(self):
        self.assertEqual(MODEL_DIMENSIONS["intfloat/e5-small-v2"], 384)
        self.assertEqual(MODEL_DIMENSIONS["intfloat/e5-base-v2"], 768)
        self.assertEqual(MODEL_DIMENSIONS["intfloat/e5-large-v2"], 1024)

    def test_invalid_batch_size(self):
        with self.assertRaises(ValueError):
            E5ModelConfig(batch_size=0)

    def test_query_prefix(self):
        self.assertEqual(prepare_queries(["hello", "query: world"]), ["query: hello", "query: world"])

    def test_passage_prefix(self):
        self.assertEqual(prepare_passages(["hello", "passage: world"]), ["passage: hello", "passage: world"])

    def test_blank_text_rejected(self):
        with self.assertRaises(ValueError):
            prepare_queries([" "])

    def test_single_query(self):
        model = FakeModel()
        vector = E5EmbeddingProvider(model=model).embed_query("search")
        self.assertEqual(len(vector), 3)
        self.assertEqual(model.calls[-1], ["query: search"])

    def test_batch_passages(self):
        model = FakeModel()
        vectors = E5EmbeddingProvider(model=model).embed_passages(["a", "b"])
        self.assertEqual(len(vectors), 2)
        self.assertEqual(model.calls[-1], ["passage: a", "passage: b"])

    def test_normalization_disabled(self):
        provider = E5EmbeddingProvider(model=FakeModel(), normalize_embeddings=False)
        vector = provider.embed_query("search")
        self.assertAlmostEqual(vector[0], 1.0)
        self.assertAlmostEqual(vector[1], 1.0)

    def test_count_mismatch(self):
        with self.assertRaises(ValueError):
            validate_embeddings([[1.0, 2.0]], expected_count=2)

    def test_dimension_mismatch(self):
        with self.assertRaises(ValueError):
            validate_embeddings([[1.0, 2.0], [1.0]], expected_count=2)

    def test_nan_rejected(self):
        with self.assertRaises(ValueError):
            validate_embeddings([[float("nan")]], expected_count=1)

    def test_model_info(self):
        provider = E5EmbeddingProvider(model=FakeModel())
        self.assertEqual(provider.get_model_info().dimension, 3)
        self.assertTrue(provider.get_model_info().loaded)

    def test_close(self):
        provider = E5EmbeddingProvider(model=FakeModel())
        provider.close()
        with self.assertRaises(RuntimeError):
            provider.embed_query("after close")

    def test_client(self):
        client = E5EmbeddingClient()
        client.provider = E5EmbeddingProvider(model=FakeModel())
        self.assertEqual(len(client.embed_query("query")), 3)
        self.assertEqual(len(client.embed_documents(["document"])), 1)
        client.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
