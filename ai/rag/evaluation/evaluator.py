from __future__ import annotations

from collections.abc import Sequence
from typing import Any

from .benchmarks import BenchmarkCase, BenchmarkReport
from .metrics import calculate_retrieval_metrics


class RAGEvaluator:
    """Evaluate retrieval quality against known relevant document IDs."""

    async def evaluate_case(
        self,
        retriever: Any,
        case: BenchmarkCase,
        top_k: int = 10,
    ) -> dict[str, Any]:
        if isinstance(top_k, bool) or not isinstance(top_k, int):
            raise TypeError("top_k must be an integer")
        if top_k < 1:
            raise ValueError("top_k must be greater than or equal to 1")

        retrieved = await retriever.retrieve(
            case.query,
            top_k=top_k,
            filters=dict(case.filters),
        )

        retrieved_ids = [
            item.document.document_id
            for item in retrieved
        ]

        metrics = calculate_retrieval_metrics(
            retrieved_ids,
            case.relevant_document_ids,
            k=top_k,
        )

        return {
            "case_id": case.case_id,
            "query": case.query,
            "retrieved_ids": retrieved_ids,
            "relevant_ids": list(case.relevant_document_ids),
            "metrics": metrics,
        }

    async def evaluate(
        self,
        retriever: Any,
        cases: Sequence[BenchmarkCase],
        top_k: int = 10,
    ) -> BenchmarkReport:
        results = []

        for case in cases:
            results.append(
                await self.evaluate_case(retriever, case, top_k=top_k)
            )

        metric_names = ("precision", "recall", "mrr", "ndcg")

        if results:
            aggregate = {
                name: sum(
                    result["metrics"][name] for result in results
                ) / len(results)
                for name in metric_names
            }
        else:
            aggregate = {name: 0.0 for name in metric_names}

        return BenchmarkReport(
            total_cases=len(results),
            metrics=aggregate,
            results=tuple(results),
        )


async def run_benchmark(
    retriever: Any,
    cases: Sequence[BenchmarkCase],
    top_k: int = 10,
) -> BenchmarkReport:
    """Convenience function for running a complete retrieval benchmark."""
    return await RAGEvaluator().evaluate(
        retriever,
        cases,
        top_k=top_k,
    )
