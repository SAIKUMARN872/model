from __future__ import annotations

import re

from .config import MixedbreadRerankerConfig
from .models import (
    MixedbreadRerankItem,
    MixedbreadRerankResponse,
)


class MixedbreadRerankerClient:
    """Mixedbread client with offline mock support."""

    def __init__(
        self,
        config: MixedbreadRerankerConfig,
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
    ) -> MixedbreadRerankResponse:
        if not self._initialized:
            raise RuntimeError(
                "Mixedbread reranker client is not initialized."
            )

        if not self.config.mock_mode:
            raise NotImplementedError(
                "Live Mixedbread HTTP transport is not implemented yet."
            )

        query_tokens = self._tokens(query)

        results = [
            MixedbreadRerankItem(
                index=index,
                relevance_score=self._score(
                    query_tokens,
                    document,
                ),
                text=document,
            )
            for index, document in enumerate(documents)
        ]

        results.sort(
            key=lambda item: (
                -item.relevance_score,
                item.index,
            )
        )

        if top_n is not None:
            results = results[:top_n]

        return MixedbreadRerankResponse(
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

        coverage = overlap / len(query_tokens)

        phrase_bonus = (
            0.10
            if all(
                token in document.lower()
                for token in query_tokens
            )
            else 0.0
        )

        return round(
            min(1.0, coverage + phrase_bonus),
            6,
        )

    @property
    def initialized(self) -> bool:
        return self._initialized
