from __future__ import annotations

from ai.inference_engine.engine import InferenceEngine
from ai.memory.storage.database import MemoryDatabase
from ai.model_registry.engine import ModelRegistryEngine
from ai.providers.provider_factory import (
    DependencyInjector,
    ProviderBuilder,
    ProviderLoader,
    ProviderResolver,
)
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.inference_adapter import RoutingInferenceAdapter
from ai.routing_engine.model_memory.sqlite_store import (
    SQLiteFeedbackStore,
    SQLiteModelMemory,
)


class ModelNowContainer:
    """Composition container for the ModelNow AI runtime."""

    def __init__(
        self,
        *,
        model_registry=None,
        routing_engine=None,
        inference_engine=None,
        adapter=None,
    ) -> None:
        self.model_registry = (
            model_registry
            if model_registry is not None
            else ModelRegistryEngine()
        )

        self.routing_database = None

        if routing_engine is not None:
            self.routing_engine = routing_engine
        elif adapter is not None:
            self.routing_engine = RoutingEngine(
                registry=self.model_registry,
            )
        else:
            self.routing_database = MemoryDatabase(
                "data/modelnow_routing.db"
            )

            model_memory = SQLiteModelMemory(
                database=self.routing_database,
            )
            feedback_store = SQLiteFeedbackStore(
                database=self.routing_database,
            )

            self.routing_engine = RoutingEngine(
                registry=self.model_registry,
                model_memory=model_memory,
                feedback_store=feedback_store,
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

    def close(self) -> None:
        """Release resources owned by this container."""
        if self.routing_database is not None:
            self.routing_database.close()


__all__ = ["ModelNowContainer"]
