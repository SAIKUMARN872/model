from __future__ import annotations

import asyncio

from ai.inference_engine.models import (
    InferenceBackendType,
    InferenceRequest,
    InferenceResult,
    InferenceUsage,
)
from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)
from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.inference_adapter import RoutingInferenceAdapter
from ai.routing_engine.models import RoutingRequest


class FailPrimaryInferenceEngine:
    """Fail the first model and return a result for the alternate model."""

    def __init__(self, primary_model: str, alternate_model: str) -> None:
        self.primary_model = primary_model
        self.alternate_model = alternate_model
        self.attempted_models: list[str] = []

    async def infer(self, request: InferenceRequest) -> InferenceResult:
        self.attempted_models.append(request.model)

        if request.model == self.primary_model:
            raise RuntimeError("Simulated primary model failure")

        if request.model != self.alternate_model:
            raise AssertionError(
                f"Unexpected model attempted: {request.model}"
            )

        return InferenceResult(
            request_id=request.request_id,
            model=request.model,
            backend=InferenceBackendType.TRANSFORMERS,
            content="Successful alternate-model response",
            usage=InferenceUsage(
                input_tokens=8,
                output_tokens=12,
            ),
            metadata={"mock_inference": True},
        )


def build_registry() -> ModelRegistryEngine:
    registry = ModelRegistryEngine()

    registry.register(
        ModelRecord(
            provider="mock-primary",
            model_id="primary-model",
            display_name="Primary Model",
            tier=ModelTier.SLM,
            context_window=4096,
            max_output_tokens=1024,
            pricing=ModelPricing(
                input_per_1m_tokens=0.01,
                output_per_1m_tokens=0.02,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                streaming=True,
                long_context=True,
                reasoning=True,
            ),
            latency_ms=50.0,
            quality_score=0.92,
        )
    )

    registry.register(
        ModelRecord(
            provider="mock-alternate",
            model_id="alternate-model",
            display_name="Alternate Model",
            tier=ModelTier.SLM,
            context_window=4096,
            max_output_tokens=1024,
            pricing=ModelPricing(
                input_per_1m_tokens=0.02,
                output_per_1m_tokens=0.03,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                streaming=True,
                long_context=True,
                reasoning=True,
            ),
            latency_ms=60.0,
            quality_score=0.95,
        )
    )

    return registry


async def main() -> None:
    registry = build_registry()
    routing_engine = RoutingEngine(registry=registry)

    fake_inference = FailPrimaryInferenceEngine(
        primary_model="primary-model",
        alternate_model="alternate-model",
    )

    adapter = RoutingInferenceAdapter(
        routing_engine=routing_engine,
        inference_engine=fake_inference,  # type: ignore[arg-type]
    )

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Explain the ModelNow routing architecture.",
            }
        ],
        objective=RoutingObjective.QUALITY,
        metadata={
            "request_id": "fallback-integration-test",
        },
    )

    primary_decision = await adapter.route(request)
    assert primary_decision.model_id == "alternate-model" or (
        primary_decision.model_id == "primary-model"
    )

    # Make the test independent of adaptive selector ordering: whichever
    # model the router selects is the simulated failure; the other is fallback.
    primary_model = primary_decision.model_id
    assert primary_model in {"primary-model", "alternate-model"}

    alternate_model = (
        "alternate-model"
        if primary_model == "primary-model"
        else "primary-model"
    )

    fake_inference.primary_model = primary_model
    fake_inference.alternate_model = alternate_model

    result = await adapter.infer(request)

    assert fake_inference.attempted_models == [
        primary_model,
        alternate_model,
    ], fake_inference.attempted_models

    assert result.model == alternate_model
    assert result.content == "Successful alternate-model response"
    assert result.metadata["fallback_applied"] is True
    assert result.metadata["fallback_original_model"] == primary_model
    assert result.metadata["fallback_selected_model"] == alternate_model
    assert result.metadata["fallback_failed_models"] == [primary_model]

    print("PRIMARY MODEL FAILURE: PASS")
    print("ALTERNATE MODEL ATTEMPT: PASS")
    print("ALTERNATE MODEL SUCCESS: PASS")
    print("FALLBACK METADATA: PASS")
    print("MODELNOW CROSS-MODEL FALLBACK INTEGRATION: PASS")


if __name__ == "__main__":
    asyncio.run(main())

