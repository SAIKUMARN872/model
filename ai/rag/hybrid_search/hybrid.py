from __future__ import annotations

import asyncio
from collections.abc import Mapping
from typing import Any, Protocol

from ai.rag.models import RAGDocument, RetrievedDocument
from ai.rag.hybrid_search.bm25 import BM25Retriever
from ai.rag.hybrid_search.fusion import reciprocal_rank_fusion
from ai.rag.hybrid_search.utils import (
    validate_filters,
    validate_query,
    validate_top_k,
)


class AsyncRetriever(Protocol):
    """Interface for an asynchronous semantic or external retriever."""

    async def retrieve(
        self,
        query: str,
        top_k: int = 5,
        filters: Mapping[str, Any] | None = None,
    ) -> list[RetrievedDocument]:
        ...


class HybridRetriever:
    """Combine BM25 keyword search and semantic search using RRF."""

    def __init__(
        self,
        keyword_retriever: BM25Retriever,
        semantic_retriever: AsyncRetriever | None = None,
        *,
        rank_constant: int = 60,
        candidate_multiplier: int = 3,
    ) -> None:
        if not isinstance(keyword_retriever, BM25Retriever):
            raise TypeError("keyword_retriever must be a BM25Retriever.")

        if isinstance(candidate_multiplier, bool) or not isinstance(
            candidate_multiplier, int
        ):
            raise TypeError("candidate_multiplier must be an integer.")
        if candidate_multiplier < 1:
            raise ValueError("candidate_multiplier must be at least 1.")

        if isinstance(rank_constant, bool) or not isinstance(rank_constant, int):
            raise TypeError("rank_constant must be an integer.")
        if rank_constant < 1:
            raise ValueError("rank_constant must be at least 1.")

        self.keyword_retriever = keyword_retriever
        self.semantic_retriever = semantic_retriever
        self.rank_constant = rank_constant
        self.candidate_multiplier = candidate_multiplier

    def add_documents(self, documents: list[RAGDocument]) -> None:
        """Add documents to the keyword index."""
        self.keyword_retriever.add_documents(documents)

    async def retrieve(
        self,
        query: str,
        top_k: int = 5,
        filters: Mapping[str, Any] | None = None,
    ) -> list[RetrievedDocument]:
        """Retrieve and fuse keyword and semantic search results."""
        normalized_query = validate_query(query)
        validate_top_k(top_k)
        normalized_filters = validate_filters(filters)

        candidate_k = top_k * self.candidate_multiplier

        keyword_task = self.keyword_retriever.retrieve(
            normalized_query,
            top_k=candidate_k,
            filters=normalized_filters,
        )

        if self.semantic_retriever is None:
            result_lists = [await keyword_task]
        else:
            keyword_results, semantic_results = await asyncio.gather(
                keyword_task,
                self.semantic_retriever.retrieve(
                    normalized_query,
                    top_k=candidate_k,
                    filters=normalized_filters,
                ),
            )
            result_lists = [keyword_results, semantic_results]

        return reciprocal_rank_fusion(
            result_lists,
            top_k=top_k,
            rank_constant=self.rank_constant,
        )


__all__ = ["AsyncRetriever", "HybridRetriever"]
