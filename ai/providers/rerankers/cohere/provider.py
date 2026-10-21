from __future__ import annotations

from time import perf_counter

from ..common import (
    BaseReranker,
    RerankRequest,
    RerankResponse,
    RerankResult,
    RerankerProviderError,
)
from .client import CohereRerankerClient
from .config import CohereRerankerConfig
from .models import CohereRerankerModelInfo


class CohereRerankerProvider(BaseReranker):
    """ModelNow Cohere reranker provider."""

    provider_id = "cohere"

    def __init__(
        self,
        config: CohereRerankerConfig | None = None,
    ) -> None:
        self.cohere_config = (
            config
            or CohereRerankerConfig.from_env()
        )

        self.client = CohereRerankerClient(
            self.cohere_config
        )

        super().__init__(
            self.cohere_config
        )

    async def initialize(self) -> None:
        try:
            await self.client.initialize()
            self._initialized = True

        except Exception as exc:
            self._initialized = False

            raise RerankerProviderError(
                f"Cohere reranker initialization failed: {exc}"
            ) from exc

    async def close(self) -> None:
        await self.client.close()
        self._initialized = False

    async def health_check(self) -> bool:
        return (
            self._initialized
            and self.client.initialized
        )

    async def rerank(
        self,
        request: RerankRequest,
    ) -> RerankResponse:
        self.validate_request(request)

        if not self.initialized:
            raise RerankerProviderError(
                "Cohere reranker provider is not initialized."
            )

        documents = (
            request.normalized_documents()
        )

        started = perf_counter()

        try:
            result = await self.client.rerank(
                request.query,
                [
                    document.text
                    for document in documents
                ],
                top_n=request.top_n,
            )

        except Exception as exc:
            raise RerankerProviderError(
                f"Cohere reranking failed: {exc}"
            ) from exc

        rerank_results = tuple(
            RerankResult(
                index=item.index,
                score=item.relevance_score,
                document=(
                    documents[item.index]
                    if request.return_documents
                    else None
                ),
                metadata={
                    "provider": self.provider_id,
                    "model": result.model,
                    "relevance_score": (
                        item.relevance_score
                    ),
                },
            )
            for item in result.results
        )

        latency_ms = (
            perf_counter() - started
        ) * 1000.0

        return RerankResponse(
            provider=self.provider_id,
            model=result.model,
            results=rerank_results,
            latency_ms=latency_ms,
            request_id=result.request_id,
            metadata={
                "mock_mode": (
                    self.cohere_config.mock_mode
                ),
                "document_count": len(
                    documents
                ),
            },
        )

    def model_info(
        self,
    ) -> CohereRerankerModelInfo:
        return CohereRerankerModelInfo(
            id=self.cohere_config.model
        )
