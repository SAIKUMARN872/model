from __future__ import annotations

from ai.inference_engine.engine import InferenceEngine
from ai.model_registry.engine import ModelRegistryEngine
from ai.providers.provider_factory import (
    DependencyInjector,
    ProviderBuilder,
    ProviderLoader,
    ProviderResolver,
)
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.inference_adapter import RoutingInferenceAdapter


class ModelNowContainer:
    """Composition container for the ModelNow AI runtime."""

    def __init__(
        self,
        *,
        model_registry: ModelRegistryEngine | None = None,
        routing_engine: RoutingEngine | None = None,
        inference_engine: InferenceEngine | None = None,
        adapter: RoutingInferenceAdapter | None = None,
    ) -> None:
        self.model_registry = (
            model_registry
            if model_registry is not None
            else ModelRegistryEngine()
        )

        self.routing_engine = (
            routing_engine
            if routing_engine is not None
            else RoutingEngine(
                registry=self.model_registry,
            )
        )

        self.inference_engine = (
            inference_engine
            if inference_engine is not None
            else InferenceEngine()
        )

        self.provider_loader = ProviderLoader()
        self.provider_resolver = ProviderResolver()
        self.provider_builder = ProviderBuilder()
        self.dependency_injector = DependencyInjector()

        self.adapter = (
            adapter
            if adapter is not None
            else RoutingInferenceAdapter(
                routing_engine=self.routing_engine,
                inference_engine=self.inference_engine,
            )
        )


__all__ = ["ModelNowContainer"]
