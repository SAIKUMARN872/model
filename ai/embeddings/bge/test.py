import os
import unittest

from ai.embeddings.bge import (
    BGEProvider,
    DEFAULT_BGE_MODEL,
    DEFAULT_BGE_DIMENSION,
    BGE_QUERY_INSTRUCTION,
    prepare_passages,
    prepare_queries,
)
from ai.embeddings.exceptions import (
    EmbeddingProviderError,
    EmbeddingValidationError,
)


class BGEUnitTests(unittest.TestCase):
    def test_default_configuration(self):
        provider = BGEProvider()
        self.assertEqual(provider.model_name, DEFAULT_BGE_MODEL)
        self.assertEqual(provider.batch_size, 32)
        self.assertFalse(provider.is_loaded)
        self.assertEqual(DEFAULT_BGE_DIMENSION, 384)

    def test_invalid_configuration(self):
        with self.assertRaises(ValueError):
            BGEProvider(batch_size=0)
        with self.assertRaises(ValueError):
            BGEProvider(max_sequence_length=0)
        with self.assertRaises(ValueError):
            BGEProvider(model_name=" ")

    def test_passage_validation(self):
        self.assertEqual(
            prepare_passages(["  document one  ", "document two"]),
            ["document one", "document two"],
        )
        for value in ("not-a-list", [], ["valid", "  "], [None]):
            with self.subTest(value=value):
                with self.assertRaises(EmbeddingValidationError):
                    prepare_passages(value)

    def test_query_instruction(self):
        result = prepare_queries(["find related documents"])
        self.assertEqual(
            result,
            [BGE_QUERY_INSTRUCTION + "find related documents"],
        )
        self.assertEqual(
            prepare_queries(result),
            result,
        )

    def test_lazy_loading(self):
        provider = BGEProvider()
        self.assertFalse(provider.is_loaded)

    def test_close_is_safe_before_loading(self):
        provider = BGEProvider()
        provider.close()
        self.assertFalse(provider.is_loaded)


class BGERealModelIntegrationTests(unittest.TestCase):
    @unittest.skipUnless(
        os.environ.get("MODELNOW_RUN_BGE_INTEGRATION") == "1",
        "Set MODELNOW_RUN_BGE_INTEGRATION=1 to run actual BGE inference",
    )
    def test_real_model_embeddings_and_retrieval_query(self):
        provider = BGEProvider()
        documents = provider.embed([
            "Model routing selects a model for a request.",
            "Vector search retrieves semantically similar documents.",
        ])
        query = provider.embed_query("How does semantic retrieval work?")

        self.assertEqual(len(documents), 2)
        self.assertEqual(len(documents[0]), DEFAULT_BGE_DIMENSION)
        self.assertEqual(len(documents[1]), DEFAULT_BGE_DIMENSION)
        self.assertEqual(len(query), DEFAULT_BGE_DIMENSION)
        self.assertTrue(all(
            isinstance(value, float)
            for vector in documents + [query]
            for value in vector
        ))
        self.assertTrue(all(
            __import__("math").isfinite(value)
            for vector in documents + [query]
            for value in vector
        ))
        provider.close()


if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromModule(
        __import__(__name__)
    )
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
