"""Offline tests for ModelNow embedding evaluation."""

import unittest

from ai.embeddings.evaluation import (
    EmbeddingEvaluator, benchmark_embeddings, cosine_similarity,
    pairwise_cosine_similarity, precision_at_k, recall_at_k,
    reciprocal_rank, mean_reciprocal_rank, ndcg_at_k,
    mean_absolute_error, root_mean_squared_error, pearson_correlation,
)


class DeterministicProvider:
    """Tiny deterministic provider for testing the evaluation logic only."""
    def embed_texts(self, texts):
        table = {
            "cat": [1.0, 0.0],
            "feline": [0.9, 0.1],
            "car": [0.0, 1.0],
            "vehicle": [0.1, 0.9],
            "query": [1.0, 0.0],
            "doc-a": [0.95, 0.05],
            "doc-b": [0.0, 1.0],
        }
        return [table.get(text, [0.5, 0.5]) for text in texts]


class EvaluationTests(unittest.TestCase):
    def test_cosine_and_pairwise(self):
        self.assertAlmostEqual(cosine_similarity([1, 0], [1, 0]), 1.0)
        self.assertAlmostEqual(cosine_similarity([1, 0], [0, 1]), 0.0)
        self.assertEqual(len(pairwise_cosine_similarity([[1, 0], [0, 1]])), 2)

    def test_cosine_invalid_inputs(self):
        for a, b in (([0, 0], [1, 0]), ([1], [1, 2]), ([float("nan")], [1])):
            with self.assertRaises(ValueError):
                cosine_similarity(a, b)

    def test_retrieval_metrics(self):
        ranked, relevant = ["a", "b", "c"], {"b", "c"}
        self.assertAlmostEqual(precision_at_k(ranked, relevant, 2), 0.5)
        self.assertAlmostEqual(recall_at_k(ranked, relevant, 2), 0.5)
        self.assertAlmostEqual(reciprocal_rank(ranked, relevant), 0.5)
        self.assertAlmostEqual(mean_reciprocal_rank([ranked], [relevant]), 0.5)
        self.assertAlmostEqual(ndcg_at_k([3, 2, 1], 3), 1.0)

    def test_error_metrics(self):
        self.assertAlmostEqual(mean_absolute_error([1, 2], [1, 3]), 0.5)
        self.assertAlmostEqual(root_mean_squared_error([1, 2], [1, 3]), 2 ** -0.5)
        self.assertAlmostEqual(pearson_correlation([1, 2, 3], [2, 4, 6]), 1.0)

    def test_similarity_evaluator(self):
        evaluator = EmbeddingEvaluator(DeterministicProvider())
        result = evaluator.evaluate_similarity([
            {"left": "cat", "right": "feline", "score": 0.9},
            {"left": "cat", "right": "car", "score": 0.0},
        ])
        self.assertEqual(result["pairs_evaluated"], 2)
        self.assertIn("root_mean_squared_error", result)

    def test_retrieval_evaluator(self):
        evaluator = EmbeddingEvaluator(DeterministicProvider())
        result = evaluator.evaluate_retrieval(
            "query", ["doc-a", "doc-b"], ["a", "b"], ks=(1, 2)
        )
        self.assertEqual(result["ranked_document_ids"][0], "a")
        self.assertIn("recall@1", result["metrics"])

    def test_benchmark(self):
        result = benchmark_embeddings(
            DeterministicProvider(), ["cat", "car"], repeats=2, warmup=0, batch_sizes=[1, 2]
        )
        self.assertEqual(len(result["results"]), 2)
        self.assertGreater(result["results"][0]["throughput_texts_per_second"], 0)

    def test_invalid_similarity_pair(self):
        with self.assertRaises(ValueError):
            EmbeddingEvaluator(DeterministicProvider()).evaluate_similarity([
                {"left": "", "right": "cat", "score": 0.5}
            ])

    def test_provider_output_count_mismatch(self):
        with self.assertRaises(ValueError):
            benchmark_embeddings(lambda texts: [[1.0, 0.0]], ["cat", "car"], repeats=1, warmup=0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
