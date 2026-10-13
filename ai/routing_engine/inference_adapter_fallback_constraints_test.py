from __future__ import annotations

import asyncio

from ai.inference_engine.models import InferenceRequest
from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.inference_adapter import RoutingInferenceAdapter
from ai.routing_engine.models import RoutingRequest

from ai.routing_engine.inference_adapter_fallback_test import build_registry


class FailEveryModelInferenceEngine:
    def __init__(self) -> None:
        self.attempted_models: list[str] = []

    async def infer(self, request: InferenceRequest):
        self.attempted_models.append(request.model)
        raise RuntimeError(f"Simulated failure for {request.model}")


async def main() -> None:
    registry = build_registry()
    routing_engine = RoutingEngine(registry=registry)
    fake_inference = FailEveryModelInferenceEngine()

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
        min_quality=0.94,
        max_latency_ms=70,
        required_capabilities=("long_context", "reasoning"),
        metadata={"request_id": "fallback-quality-constraint-test"},
    )

    decision = await adapter.route(request)

    assert decision.model_id == "alternate-model", (
        f"Expected eligible model, got {decision.model_id!r}"
    )

    try:
        await adapter.infer(request)
    except RuntimeError as error:
        assert "Simulated failure for" in str(error), str(error)
    else:
        raise AssertionError(
            "Inference must fail when the only eligible model fails."
        )

    assert fake_inference.attempted_models == ["alternate-model"], (
        "ModelNow attempted a model that should not satisfy the request: "
        f"{fake_inference.attempted_models}"
    )

    print("MINIMUM QUALITY ENFORCED: PASS")
    print("MAXIMUM LATENCY ENFORCED: PASS")
    print("REQUIRED CAPABILITIES ENFORCED: PASS")
    print("INELIGIBLE MODEL NEVER ATTEMPTED: PASS")
    print("FINAL ERROR PROPAGATED: PASS")
    print("MODELNOW FALLBACK CONSTRAINT INTEGRATION: PASS")


if __name__ == "__main__":
    asyncio.run(main())
