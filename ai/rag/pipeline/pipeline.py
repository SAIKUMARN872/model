from __future__ import annotations

from typing import Any

from ai.rag.context_builder import ContextBuilder
from ai.rag.interfaces import AnswerGenerator, Retriever
from ai.rag.models import RAGRequest, RAGResponse, RAGDocument, RetrievedDocument
from ai.rag.ranking import RAGReranker, RankingDocument
from ai.rag.pipeline.utils import build_context, validate_rag_request


class RAGPipeline:
    """Coordinates retrieval, reranking, context building, and generation."""

    def __init__(
        self,
        retriever: Retriever,
        reranker: RAGReranker | None = None,
        generator: AnswerGenerator | None = None,
        context_builder: ContextBuilder | None = None,
    ) -> None:
        self.retriever = retriever
        self.reranker = reranker
        self.generator = generator
        self.context_builder = context_builder

    async def run(self, request: RAGRequest) -> RAGResponse:
        validate_rag_request(request)

        retrieved = list(
            await self.retriever.retrieve(
                query=request.query,
                top_k=request.top_k,
                filters=request.filters,
            )
        )

        sources: list[RetrievedDocument] = retrieved
        reranking_used = False

        if self.reranker is not None and retrieved:
            ranking_documents = [
                RankingDocument(
                    text=item.document.text,
                    document_id=item.document.document_id,
                    metadata=dict(item.document.metadata),
                )
                for item in retrieved
            ]

            rerank_top_n = request.rerank_top_n
            if rerank_top_n is None:
                rerank_top_n = len(ranking_documents)
            rerank_top_n = min(rerank_top_n, len(ranking_documents))

            reranked = await self.reranker.rerank(
                query=request.query,
                documents=ranking_documents,
                top_n=rerank_top_n,
            )

            sources = []
            for rank, item in enumerate(reranked, start=1):
                original = retrieved[item.index].document
                ranked_document = RAGDocument(
                    document_id=(
                        item.document.document_id or original.document_id
                    ),
                    text=item.document.text,
                    metadata=dict(item.document.metadata),
                )
                sources.append(
                    RetrievedDocument(
                        document=ranked_document,
                        score=item.score,
                        rank=rank,
                    )
                )
            reranking_used = True

        if request.min_score is not None:
            sources = [
                item for item in sources if item.score >= request.min_score
            ]
            sources = [
                RetrievedDocument(
                    document=item.document,
                    score=item.score,
                    rank=rank,
                )
                for rank, item in enumerate(sources, start=1)
            ]

        metadata: dict[str, Any] = {
            "retrieved_count": len(retrieved),
            "result_count": len(sources),
            "reranking_used": reranking_used,
        }

        if self.context_builder is not None:
            build_result = self.context_builder.build(sources)
            context = build_result.context
            sources = list(build_result.sources)

            metadata.update(
                {
                    "context_character_count": build_result.character_count,
                    "context_truncated_count": build_result.truncated_count,
                    "context_omitted_count": build_result.omitted_count,
                    "context_builder_used": True,
                }
            )
        else:
            context = self._build_context(sources)

        answer: str | None = None

        if self.generator is not None and sources:
            answer = await self.generator.generate(
                query=request.query,
                context=context,
                sources=sources,
            )

        return RAGResponse(
            query=request.query,
            context=context,
            sources=tuple(sources),
            answer=answer,
            metadata=metadata,
        )

    @staticmethod
    def _build_context(sources: list[RetrievedDocument]) -> str:
        return build_context(sources)


__all__ = ["RAGPipeline"]
