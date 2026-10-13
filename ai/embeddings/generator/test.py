"""Offline tests for ModelNow embedding generation."""

import math
import unittest

from .encoder import EmbeddingEncoder
from .generator import EmbeddingGenerator
from .models import GeneratedEmbedding, GenerationConfig
from .pipeline import EmbeddingPipeline
from .utils import chunked, validate_metadata, validate_texts, validate_vectors


class FakeBackend:
    model_name = "fake-embedding-model"

    def __init__(self):
        self.calls = []
        self.closed = False

    def embed_texts(self, texts, normalize=True):
        self.calls.append(list(texts))
        vectors = []
        for text in texts:
            values = [float(len(text)), float(sum(map(ord, text)) % 11 + 1), 1.0]
            if normalize:
                norm = math.sqrt(sum(value * value for value in values))
                values = [value / norm for value in values]
            vectors.append(values)
        return vectors

    def close(self):
        self.closed = True


class GeneratorTests(unittest.TestCase):
    def setUp(self):
        self.backend = FakeBackend()

    def test_default_config(self):
        config = GenerationConfig()
        self.assertEqual(config.batch_size, 32)
        self.assertTrue(config.normalize)
        self.assertEqual(config.namespace, "modelnow")

    def test_invalid_batch_size(self):
        for size in (0, 513, True, 1.5):
            with self.subTest(size=size):
                with self.assertRaises((ValueError, TypeError)):
                    GenerationConfig(batch_size=size)

    def test_validate_texts(self):
        self.assertEqual(validate_texts(["alpha", "beta"]), ["alpha", "beta"])

    def test_blank_text_rejected(self):
        with self.assertRaises(ValueError):
            validate_texts(["alpha", "  "])

    def test_non_string_rejected(self):
        with self.assertRaises(TypeError):
            validate_texts(["alpha", 42])

    def test_vector_count_validation(self):
        with self.assertRaises(ValueError):
            validate_vectors([[1.0, 2.0]], expected_count=2)

    def test_vector_dimension_validation(self):
        with self.assertRaises(ValueError):
            validate_vectors([[1.0, 2.0], [1.0]], expected_count=2)

    def test_nan_rejected(self):
        with self.assertRaises(ValueError):
            validate_vectors([[float("nan")]], expected_count=1)

    def test_chunked(self):
        self.assertEqual(chunked([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]])

    def test_metadata_count_validation(self):
        with self.assertRaises(ValueError):
            validate_metadata([{"source": "a"}], expected_count=2)

    def test_generate_records(self):
        generator = EmbeddingGenerator(self.backend)
        records = generator.generate(
            ["first text", "second text"],
            [{"source": "a"}, {"source": "b"}],
        )
        self.assertEqual(len(records), 2)
        self.assertIsInstance(records[0], GeneratedEmbedding)
        self.assertEqual(records[0].index, 0)
        self.assertEqual(records[1].metadata, {"source": "b"})
        self.assertEqual(records[0].model_name, "fake-embedding-model")

    def test_batching(self):
        generator = EmbeddingGenerator(
            self.backend, GenerationConfig(batch_size=2)
        )
        records = generator.generate(["a", "bb", "ccc", "dddd", "eeeee"])
        self.assertEqual(len(records), 5)
        self.assertEqual([len(batch) for batch in self.backend.calls], [2, 2, 1])

    def test_empty_input(self):
        generator = EmbeddingGenerator(self.backend)
        self.assertEqual(generator.generate([]), [])
        self.assertEqual(self.backend.calls, [])

    def test_generate_vectors(self):
        vectors = EmbeddingGenerator(self.backend).generate_vectors(["hello"])
        self.assertEqual(len(vectors), 1)
        self.assertEqual(len(vectors[0]), 3)

    def test_normalized_vectors(self):
        records = EmbeddingGenerator(self.backend).generate(["hello"])
        norm = math.sqrt(sum(value * value for value in records[0].vector))
        self.assertAlmostEqual(norm, 1.0, places=6)

    def test_encoder_single(self):
        vector = EmbeddingEncoder(self.backend).encode_one("hello")
        self.assertEqual(len(vector), 3)

    def test_pipeline(self):
        pipeline = EmbeddingPipeline(self.backend)
        records = pipeline.run(["alpha", "beta"])
        self.assertEqual([record.index for record in records], [0, 1])

    def test_close(self):
        generator = EmbeddingGenerator(self.backend)
        generator.close()
        self.assertTrue(self.backend.closed)

    def test_config_type(self):
        with self.assertRaises(TypeError):
            EmbeddingGenerator(self.backend, config={})


if __name__ == "__main__":
    unittest.main()
