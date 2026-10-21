from __future__ import annotations

import asyncio

from ai.inference_engine.models import InferenceRequest
from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.inference_adapter import RoutingInferenceAdapter
from ai.routing_engine.models import RoutingRequest

from ai.routing_engine.inference_adapter_fallback_test import build_registry


class FailEveryModelInferenceEngine:
    """Simulate every model failing so fallback exhaustion can be verified."""

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
        metadata={"request_id": "fallback-exhaustion-test"},
    )

    try:
        await adapter.infer(request)
    except RuntimeError as error:
        assert "Simulated failure for" in str(error), str(error)
        print("FINAL INFERENCE ERROR PROPAGATED: PASS")
    else:
        raise AssertionError(
            "Inference must fail when every eligible model fails."
        )

    assert len(fake_inference.attempted_models) >= 2, (
        "Expected the primary model and at least one fallback attempt; "
        f"got {fake_inference.attempted_models}"
    )

    assert len(set(fake_inference.attempted_models)) == len(
        fake_inference.attempted_models
    ), f"A model was attempted more than once: {fake_inference.attempted_models}"

    assert set(fake_inference.attempted_models) == {
        "primary-model",
        "alternate-model",
    }, fake_inference.attempted_models

    print("ALL ELIGIBLE MODELS ATTEMPTED: PASS")
    print("NO DUPLICATE MODEL ATTEMPTS: PASS")
    print("NO FALSE SUCCESS RESPONSE: PASS")
    print("ATTEMPTED MODELS:", fake_inference.attempted_models)
    print("MODELNOW FALLBACK EXHAUSTION TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())
