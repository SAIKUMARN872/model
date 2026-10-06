from __future__ import annotations

from ai.inference_engine.backends.transformers.engine import TransformersBackend
from ai.providers.slm.qwen import QwenProvider
from ai.model_registry.utils import model_info_to_record
from ai.routing_engine.inference_adapter import RoutingInferenceAdapter

from .container import ModelNowContainer


class ModelNowRuntime:
    """Fully composed ModelNow AI runtime."""

    def __init__(
        self,
        container: ModelNowContainer,
        provider: QwenProvider,
        backend: TransformersBackend,
    ) -> None:
        self.container = container
        self.provider = provider
        self.backend = backend

    @property
    def adapter(self) -> RoutingInferenceAdapter:
        return self.container.adapter

    @property
    def model_registry(self):
        return self.container.model_registry

    @property
    def routing_engine(self):
        return self.container.routing_engine

    @property
    def inference_engine(self):
        return self.container.inference_engine

    async def initialize(self) -> None:
        await self.provider.initialize()
        await self._register_provider_models()

        if self.container.inference_engine.get_backend(
            self.backend.backend_type.value
        ) is None:
            self.container.inference_engine.register_backend(
                self.backend
            )

        await self.container.inference_engine.initialize()

    async def _register_provider_models(self) -> None:
        model_infos = await self.provider.list_models()

        records = [
            model_info_to_record(model)
            for model in model_infos
        ]

        for record in records:
            existing = self.model_registry.get(
                record.provider,
                record.model_id,
            )

            if existing is None:
                self.model_registry.register(record)

    async def close(self) -> None:
        await self.container.inference_engine.close()


def create_runtime() -> ModelNowRuntime:
    """Create the default local ModelNow runtime."""

    container = ModelNowContainer()

    provider = QwenProvider()

    backend = TransformersBackend(
        providers=[provider],
    )

    return ModelNowRuntime(
        container=container,
        provider=provider,
        backend=backend,
    )


__all__ = [
    "ModelNowRuntime",
    "create_runtime",
]
