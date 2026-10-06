from __future__ import annotations

from collections.abc import AsyncIterator

from ...interfaces import InferenceBackend
from ...models import (
    InferenceBackendType,
    InferenceHealth,
    InferenceRequest,
    InferenceResult,
)
from ....providers.base.provider import BaseProvider

from .client import TransformersClient
from .config import TransformersConfig


class TransformersBackend(InferenceBackend):
    """ModelNow local Transformers inference backend."""

    backend_type = InferenceBackendType.TRANSFORMERS

    def __init__(
        self,
        providers: list[BaseProvider] | None = None,
        config: TransformersConfig | None = None,
    ) -> None:
        self.config = config or TransformersConfig()
        self.client = TransformersClient(providers)
        self._initialized = False

    @property
    def initialized(self) -> bool:
        return self._initialized

    async def initialize(self) -> None:
        if not self.config.enabled:
            return

        for provider in self.client.providers:
            if not provider.initialized:
                await provider.initialize()

        self._initialized = True

    async def close(self) -> None:
        for provider in self.client.providers:
            if provider.initialized:
                await provider.close()

        self._initialized = False

    async def health_check(self) -> InferenceHealth:
        if not self.config.enabled:
            return InferenceHealth(
                healthy=False,
                backend=self.backend_type,
                message="Transformers backend is disabled.",
            )

        return InferenceHealth(
            healthy=True,
            backend=self.backend_type,
            message="Transformers backend is ready.",
            metadata={
                "provider_count": len(
                    self.client.providers
                ),
                "device": self.config.device,
                "max_concurrent_requests": (
                    self.config.max_concurrent_requests
                ),
            },
        )

    async def supports_model(
        self,
        model: str,
    ) -> bool:
        for provider in self.client.providers:
            if await provider.supports_model(model):
                return True

        return False

    async def infer(
        self,
        request: InferenceRequest,
    ) -> InferenceResult:
        if not self._initialized:
            await self.initialize()

        if not self.config.enabled:
            raise RuntimeError(
                "Transformers backend is disabled."
            )

        return await self.client.infer(request)

    async def stream(
        self,
        request: InferenceRequest,
    ) -> AsyncIterator[InferenceResult]:
        if not self._initialized:
            await self.initialize()

        if not self.config.enabled:
            raise RuntimeError(
                "Transformers backend is disabled."
            )

        async for result in self.client.stream(
            request
        ):
            yield result


__all__ = ["TransformersBackend"]
