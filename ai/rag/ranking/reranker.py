from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Sequence

from ai.rag.ranking.utils import validate_score, validate_top_n

from ai.providers.rerankers import (
    RerankDocument,
    RerankRequest,
    RerankResponse,
    RerankerSelector,
    create_default_reranker_registry,
)


@dataclass(frozen=True, slots=True)
class RankingDocument:
    text: str
    document_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class RankingResult:
    index: int
    score: float
    document: RankingDocument
    provider: str
    model: str


class RAGReranker:
    """Adapts shared ModelNow reranker providers to the RAG layer."""

    def __init__(
        self,
        selector: RerankerSelector | None = None,
        provider_id: str = "bge",
    ) -> None:
        registry = (
            create_default_reranker_registry()
            if selector is None
            else None
        )
        self.selector = selector or RerankerSelector(registry)
        self.provider_id = provider_id

    async def rerank(
        self,
        query: str,
        documents: Sequence[RankingDocument | str],
        top_n: int | None = None,
    ) -> list[RankingResult]:
        if not query or not query.strip():
            raise ValueError("RAG reranking query cannot be empty.")

        if not documents:
            validate_top_n(top_n, 0)
            return []

        validate_top_n(top_n, len(documents))

        normalized: list[RankingDocument] = []
        shared_documents: list[RerankDocument] = []

        for index, item in enumerate(documents):
            if isinstance(item, RankingDocument):
                document = item
            else:
                document = RankingDocument(
                    text=str(item),
                    document_id=str(index),
                )

            if not document.text.strip():
                raise ValueError(
                    f"RAG document at index {index} has empty text."
                )

            normalized.append(document)
            shared_documents.append(
                RerankDocument(
                    text=document.text,
                    document_id=document.document_id or str(index),
                    metadata=dict(document.metadata),
                )
            )

        selection = self.selector.select(self.provider_id)
        provider = selection.reranker_class()
        await provider.initialize()

        try:
            response: RerankResponse = await provider.rerank(
                RerankRequest(
                    query=query,
                    documents=shared_documents,
                    top_n=top_n,
                )
            )

            results: list[RankingResult] = []
            for item in response.results:
                if item.index < 0 or item.index >= len(normalized):
                    raise ValueError(
                        f"Reranker returned invalid document index: {item.index}"
                    )

                source_document = normalized[item.index]
                result_document = source_document

                if item.document is not None:
                    result_document = RankingDocument(
                        text=item.document.text,
                        document_id=(
                            item.document.document_id
                            or source_document.document_id
                        ),
                        metadata=dict(item.document.metadata),
                    )

                score = validate_score(item.score)
                results.append(
                    RankingResult(
                        index=item.index,
                        score=score,
                        document=result_document,
                        provider=response.provider,
                        model=response.model,
                    )
                )

            return results
        finally:
            await provider.close()


__all__ = [
    "RankingDocument",
    "RankingResult",
    "RAGReranker",
]
