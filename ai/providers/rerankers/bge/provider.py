from __future__ import annotations

from time import perf_counter

from ..common import (
    BaseReranker,
    RerankRequest,
    RerankResponse,
    RerankResult,
    RerankerProviderError,
)
from .client import BGEClient
from .config import BGEConfig
from .models import BGEModelInfo


class BGEProvider(BaseReranker):
    """ModelNow BGE reranker provider."""

    provider_id = "bge"

    def __init__(
        self,
        config: BGEConfig | None = None,
    ) -> None:
        self.bge_config = (
            config or BGEConfig.from_env()
        )

        self.client = BGEClient(
            self.bge_config
        )

        super().__init__(
            self.bge_config
        )

    async def initialize(self) -> None:
        try:
            await self.client.initialize()
            self._initialized = True

        except Exception as exc:
            self._initialized = False

            raise RerankerProviderError(
                f"BGE initialization failed: {exc}"
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
                "BGE provider is not initialized."
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
                f"BGE reranking failed: {exc}"
            ) from exc

        rerank_results = tuple(
            RerankResult(
                index=item.index,
                score=item.score,
                document=(
                    documents[item.index]
                    if request.return_documents
                    else None
                ),
                metadata={
                    "provider": self.provider_id,
                    "model": result.model,
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
                "local_mode": (
                    self.bge_config.local_mode
                ),
                "document_count": len(
                    documents
                ),
            },
        )

    def model_info(self) -> BGEModelInfo:
        return BGEModelInfo(
            id=self.bge_config.model
        )
