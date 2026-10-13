from __future__ import annotations

import re

from .config import BGEConfig
from .models import BGERerankItem, BGERerankResponse


class BGEClient:
    """Dependency-free local development/test client."""

    def __init__(self, config: BGEConfig) -> None:
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
    ) -> BGERerankResponse:
        if not self._initialized:
            raise RuntimeError(
                "BGE client is not initialized."
            )

        query_tokens = self._tokens(query)

        scored = [
            BGERerankItem(
                index=index,
                score=self._score(
                    query_tokens,
                    document,
                ),
                text=document,
            )
            for index, document in enumerate(documents)
        ]

        scored.sort(
            key=lambda item: (
                -item.score,
                item.index,
            )
        )

        if top_n is not None:
            scored = scored[:top_n]

        return BGERerankResponse(
            model=self.config.model,
            results=tuple(scored),
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

        score = overlap / len(query_tokens)

        if all(
            token in document.lower()
            for token in query_tokens
        ):
            score += 0.10

        return round(
            min(1.0, score),
            6,
        )

    @property
    def initialized(self) -> bool:
        return self._initialized
