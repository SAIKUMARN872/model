from __future__ import annotations

import asyncio
import unittest
from types import SimpleNamespace

from .benchmarks import BenchmarkCase
from .evaluator import RAGEvaluator
from .metrics import (
    calculate_retrieval_metrics,
    ndcg_at_k,
    precision_at_k,
    recall_at_k,
    reciprocal_rank,
)


class FakeRetriever:
    def __init__(self, document_ids: list[str]) -> None:
        self.document_ids = document_ids
        self.last_query = None
        self.last_top_k = None
        self.last_filters = None

    async def retrieve(
        self,
        query: str,
        top_k: int = 5,
        filters=None,
    ):
        self.last_query = query
        self.last_top_k = top_k
        self.last_filters = filters

        return [
            SimpleNamespace(
                document=SimpleNamespace(document_id=document_id),
                score=1.0,
            )
            for document_id in self.document_ids[:top_k]
        ]


class EvaluationTests(unittest.TestCase):
    def test_precision_at_k(self):
        self.assertAlmostEqual(
            precision_at_k(
                ["a", "b", "c"],
                ["a", "c"],
                k=2,
            ),
            0.5,
        )

    def test_recall_at_k(self):
        self.assertAlmostEqual(
            recall_at_k(
                ["a", "b"],
                ["a", "c"],
                k=2,
            ),
            0.5,
        )

    def test_reciprocal_rank(self):
        self.assertEqual(
            reciprocal_rank(["wrong", "target"], ["target"]),
            0.5,
        )
        self.assertEqual(
            reciprocal_rank(["a", "b"], ["target"]),
            0.0,
        )

    def test_ndcg_at_k(self):
        self.assertEqual(
            ndcg_at_k(["a", "b"], ["a"]),
            1.0,
        )
        self.assertLess(
            ndcg_at_k(["wrong", "a"], ["a"]),
            1.0,
        )

    def test_combined_metrics(self):
        metrics = calculate_retrieval_metrics(
            ["a", "b", "c"],
            ["a", "b"],
            k=3,
        )

        self.assertAlmostEqual(metrics["precision"], 2 / 3)
        self.assertEqual(metrics["recall"], 1.0)
        self.assertEqual(metrics["mrr"], 1.0)
        self.assertEqual(metrics["ndcg"], 1.0)

    def test_empty_inputs(self):
        metrics = calculate_retrieval_metrics([], ["a"])

        self.assertEqual(metrics["precision"], 0.0)
        self.assertEqual(metrics["recall"], 0.0)
        self.assertEqual(metrics["mrr"], 0.0)
        self.assertEqual(metrics["ndcg"], 0.0)

    def test_no_relevant_documents(self):
        metrics = calculate_retrieval_metrics(["a", "b"], [])

        self.assertEqual(metrics["recall"], 0.0)
        self.assertEqual(metrics["mrr"], 0.0)
        self.assertEqual(metrics["ndcg"], 0.0)

    def test_duplicate_retrieved_ids(self):
        metrics = calculate_retrieval_metrics(
            ["a", "a", "b"],
            ["a", "b"],
        )

        self.assertEqual(metrics["precision"], 1.0)
        self.assertEqual(metrics["recall"], 1.0)

    def test_invalid_k(self):
        with self.assertRaises(ValueError):
            precision_at_k(["a"], ["a"], k=0)

        with self.assertRaises(TypeError):
            recall_at_k(["a"], ["a"], k=True)

    def test_benchmark_case_validation(self):
        with self.assertRaises(ValueError):
            BenchmarkCase(
                query=" ",
                relevant_document_ids=(),
            )

    def test_evaluator_integration(self):
        retriever = FakeRetriever(["a", "b", "x"])
        case = BenchmarkCase(
            query="ModelNow routing",
            relevant_document_ids=("a", "b"),
            case_id="routing-001",
            filters={"category": "technical"},
        )

        result = asyncio.run(
            RAGEvaluator().evaluate_case(
                retriever,
                case,
                top_k=3,
            )
        )

        self.assertEqual(result["case_id"], "routing-001")
        self.assertEqual(result["retrieved_ids"], ["a", "b", "x"])
        self.assertEqual(result["metrics"]["recall"], 1.0)
        self.assertEqual(retriever.last_query, "ModelNow routing")
        self.assertEqual(
            retriever.last_filters,
            {"category": "technical"},
        )

    def test_aggregate_benchmark(self):
        retriever = FakeRetriever(["a", "b"])
        cases = [
            BenchmarkCase("query one", ("a",), case_id="case-1"),
            BenchmarkCase("query two", ("b",), case_id="case-2"),
        ]

        report = asyncio.run(
            RAGEvaluator().evaluate(
                retriever,
                cases,
                top_k=2,
            )
        )

        self.assertEqual(report.total_cases, 2)
        self.assertEqual(len(report.results), 2)
        self.assertEqual(report.metrics["recall"], 1.0)
        self.assertEqual(report.metrics["mrr"], 0.75)

    def test_empty_benchmark(self):
        report = asyncio.run(
            RAGEvaluator().evaluate(
                FakeRetriever([]),
                [],
                top_k=3,
            )
        )

        self.assertEqual(report.total_cases, 0)
        self.assertTrue(
            all(value == 0.0 for value in report.metrics.values())
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)

