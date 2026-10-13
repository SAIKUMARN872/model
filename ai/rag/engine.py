from __future__ import annotations

from ai.rag.interfaces import AnswerGenerator, Retriever
from ai.rag.models import RAGRequest, RAGResponse
from ai.rag.pipeline.orchestrator import RAGOrchestrator
from ai.rag.ranking import RAGReranker


class RAGEngine:
    """Public ModelNow RAG engine."""

    def __init__(
        self,
        retriever: Retriever,
        reranker: RAGReranker | None = None,
        generator: AnswerGenerator | None = None,
    ) -> None:
        self.orchestrator = RAGOrchestrator(
            retriever=retriever,
            reranker=reranker,
            generator=generator,
        )

    async def run(self, request: RAGRequest) -> RAGResponse:
        return await self.orchestrator.execute(request)

    async def query(
        self,
        query: str,
        *,
        top_k: int = 5,
        rerank_top_n: int | None = 3,
        min_score: float | None = None,
        filters: dict | None = None,
    ) -> RAGResponse:
        return await self.orchestrator.query(
            query,
            top_k=top_k,
            rerank_top_n=rerank_top_n,
            min_score=min_score,
            filters=filters,
        )


__all__ = ["RAGEngine"]
