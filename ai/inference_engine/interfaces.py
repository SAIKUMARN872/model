from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator

from .models import (
    InferenceBackendType,
    InferenceHealth,
    InferenceRequest,
    InferenceResult,
)


class InferenceBackend(ABC):
    backend_type: InferenceBackendType

    @abstractmethod
    async def initialize(self) -> None:
        raise NotImplementedError

    @abstractmethod
    async def close(self) -> None:
        raise NotImplementedError

    @abstractmethod
    async def health_check(self) -> InferenceHealth:
        raise NotImplementedError

    @abstractmethod
    async def supports_model(self, model: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def infer(
        self,
        request: InferenceRequest,
    ) -> InferenceResult:
        raise NotImplementedError

    async def stream(
        self,
        request: InferenceRequest,
    ) -> AsyncIterator[InferenceResult]:
        raise NotImplementedError(
            f"Streaming is not implemented by "
            f"'{self.backend_type.value}'."
        )
        yield


class InferenceExecutor(ABC):
    @abstractmethod
    async def execute(
        self,
        request: InferenceRequest,
    ) -> InferenceResult:
        raise NotImplementedError

    @abstractmethod
    async def execute_stream(
        self,
        request: InferenceRequest,
    ) -> AsyncIterator[InferenceResult]:
        raise NotImplementedError
