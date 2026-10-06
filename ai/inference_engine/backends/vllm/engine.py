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

from .client import VLLMClient
from .config import VLLMConfig


class VLLMBackend(InferenceBackend):
    """ModelNow vLLM inference backend."""

    backend_type = InferenceBackendType.VLLM

    def __init__(
        self,
        providers: list[BaseProvider] | None = None,
        config: VLLMConfig | None = None,
    ) -> None:
        self.config = config or VLLMConfig()
        self.client = VLLMClient(providers)
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
                message="vLLM backend is disabled.",
            )

        return InferenceHealth(
            healthy=True,
            backend=self.backend_type,
            message="vLLM backend is ready.",
            metadata={
                "provider_count": len(
                    self.client.providers
                ),
                "base_url": self.config.base_url,
                "timeout_seconds": (
                    self.config.timeout_seconds
                ),
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
                "vLLM backend is disabled."
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
                "vLLM backend is disabled."
            )

        async for result in self.client.stream(
            request
        ):
            yield result


__all__ = ["VLLMBackend"]
