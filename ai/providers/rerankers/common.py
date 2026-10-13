from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Sequence


@dataclass(frozen=True, slots=True)
class RerankDocument:
    text: str
    document_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class RerankRequest:
    query: str
    documents: Sequence[RerankDocument | str]
    top_n: int | None = None
    model: str | None = None
    return_documents: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)

    def normalized_documents(self) -> list[RerankDocument]:
        result: list[RerankDocument] = []

        for index, document in enumerate(self.documents):
            if isinstance(document, RerankDocument):
                result.append(document)
            else:
                result.append(
                    RerankDocument(
                        text=str(document),
                        document_id=str(index),
                    )
                )

        return result


@dataclass(frozen=True, slots=True)
class RerankResult:
    index: int
    score: float
    document: RerankDocument | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class RerankResponse:
    provider: str
    model: str
    results: tuple[RerankResult, ...]
    latency_ms: float | None = None
    request_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def top_result(self) -> RerankResult | None:
        return self.results[0] if self.results else None


class RerankerError(Exception):
    """Base exception for ModelNow reranker failures."""


class RerankerConfigurationError(RerankerError):
    """Raised when reranker configuration is invalid."""


class RerankerRequestError(RerankerError):
    """Raised when a reranker request is invalid."""


class RerankerProviderError(RerankerError):
    """Raised when a reranker provider fails."""


class BaseReranker:
    """Common interface implemented by all ModelNow rerankers."""

    provider_id: str = "unknown"

    def __init__(self, config: Any = None) -> None:
        self.config = config
        self._initialized = False

    @property
    def initialized(self) -> bool:
        return self._initialized

    async def initialize(self) -> None:
        self._initialized = True

    async def close(self) -> None:
        self._initialized = False

    async def health_check(self) -> bool:
        return self._initialized

    async def rerank(
        self,
        request: RerankRequest,
    ) -> RerankResponse:
        raise NotImplementedError

    def validate_request(self, request: RerankRequest) -> None:
        if not isinstance(request, RerankRequest):
            raise RerankerRequestError(
                "request must be a RerankRequest."
            )

        if not request.query.strip():
            raise RerankerRequestError(
                "Rerank query cannot be empty."
            )

        if not request.documents:
            raise RerankerRequestError(
                "Rerank documents cannot be empty."
            )

        if request.top_n is not None and request.top_n <= 0:
            raise RerankerRequestError(
                "top_n must be greater than zero."
            )

        for document in request.normalized_documents():
            if not document.text.strip():
                raise RerankerRequestError(
                    "Rerank documents cannot contain empty text."
                )
