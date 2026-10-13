from __future__ import annotations

import re

from .config import CohereRerankerConfig
from .models import (
    CohereRerankItem,
    CohereRerankResponse,
)


class CohereRerankerClient:
    """Cohere reranker client.

    Mock mode provides deterministic offline behavior for
    development and integration testing. Real HTTP transport
    can be enabled later through configuration.
    """

    def __init__(
        self,
        config: CohereRerankerConfig,
    ) -> None:
        self.config = config
        self._initialized = False

    async def initialize(self) -> None:
        self.config.validate()
        self._initialized = True

    async def close(self) -> None:
        self._initialized = False

    async def rerank(
        self,
        query: str,
        documents: list[str],
        *,
        top_n: int | None = None,
        request_id: str | None = None,
    ) -> CohereRerankResponse:
        if not self._initialized:
            raise RuntimeError(
                "Cohere reranker client is not initialized."
            )

        if self.config.mock_mode:
            return self._mock_rerank(
                query,
                documents,
                top_n=top_n,
                request_id=request_id,
            )

        raise NotImplementedError(
            "Real Cohere HTTP transport is not enabled "
            "in this implementation."
        )

    def _mock_rerank(
        self,
        query: str,
        documents: list[str],
        *,
        top_n: int | None,
        request_id: str | None,
    ) -> CohereRerankResponse:
        query_tokens = self._tokens(query)

        results: list[CohereRerankItem] = []

        for index, document in enumerate(documents):
            score = self._score(
                query_tokens,
                document,
            )

            results.append(
                CohereRerankItem(
                    index=index,
                    relevance_score=score,
                    text=document,
                )
            )

        results.sort(
            key=lambda item: (
                -item.relevance_score,
                item.index,
            )
        )

        if top_n is not None:
            results = results[:top_n]

        return CohereRerankResponse(
            model=self.config.model,
            results=tuple(results),
            request_id=request_id,
        )

    @staticmethod
    def _tokens(text: str) -> set[str]:
        return {
            token
            for token in re.findall(
                r"[a-zA-Z0-9_]+",
                text.lower(),
            )
            if len(token) > 1
        }

    @classmethod
    def _score(
        cls,
        query_tokens: set[str],
        document: str,
    ) -> float:
        if not query_tokens:
            return 0.0

        document_tokens = cls._tokens(document)

        if not document_tokens:
            return 0.0

        overlap = len(
            query_tokens & document_tokens
        )

        coverage = (
            overlap / len(query_tokens)
        )

        exact_bonus = (
            0.10
            if all(
                token in document.lower()
                for token in query_tokens
            )
            else 0.0
        )

        return round(
            min(
                1.0,
                coverage + exact_bonus,
            ),
            6,
        )

    @property
    def initialized(self) -> bool:
        return self._initialized
