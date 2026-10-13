from __future__ import annotations

from ai.rag.interfaces import AnswerGenerator, Retriever
from ai.rag.models import RAGRequest, RAGResponse
from ai.rag.pipeline.pipeline import RAGPipeline
from ai.rag.ranking import RAGReranker


class RAGOrchestrator:
    """High-level entry point for configuring and executing RAG requests."""

    def __init__(
        self,
        retriever: Retriever,
        reranker: RAGReranker | None = None,
        generator: AnswerGenerator | None = None,
    ) -> None:
        self.pipeline = RAGPipeline(
            retriever=retriever,
            reranker=reranker,
            generator=generator,
        )

    async def execute(self, request: RAGRequest) -> RAGResponse:
        return await self.pipeline.run(request)

    async def query(
        self,
        query: str,
        *,
        top_k: int = 5,
        rerank_top_n: int | None = 3,
        min_score: float | None = None,
        filters: dict | None = None,
    ) -> RAGResponse:
        request = RAGRequest(
            query=query,
            top_k=top_k,
            rerank_top_n=rerank_top_n,
            min_score=min_score,
            filters=filters or {},
        )
        return await self.execute(request)


__all__ = ["RAGOrchestrator"]
