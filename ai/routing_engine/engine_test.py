from __future__ import annotations

import asyncio

from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)
from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.exceptions import NoRouteAvailableError
from ai.routing_engine.models import RoutingRequest


def build_registry() -> ModelRegistryEngine:
    registry = ModelRegistryEngine()

    registry.register(
        ModelRecord(
            provider="test-provider-a",
            model_id="test-slm",
            display_name="Test SLM",
            tier=ModelTier.SLM,
            context_window=4096,
            max_output_tokens=1024,
            pricing=ModelPricing(
                input_per_1m_tokens=0.05,
                output_per_1m_tokens=0.10,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                code=True,
                streaming=True,
            ),
            latency_ms=80.0,
            quality_score=0.85,
        )
    )

    registry.register(
        ModelRecord(
            provider="test-provider-b",
            model_id="test-mlm",
            display_name="Test MLM",
            tier=ModelTier.MLM,
            context_window=8192,
            max_output_tokens=2048,
            pricing=ModelPricing(
                input_per_1m_tokens=0.20,
                output_per_1m_tokens=0.40,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                reasoning=True,
                code=True,
                streaming=True,
            ),
            latency_ms=150.0,
            quality_score=0.92,
        )
    )

    registry.register(
        ModelRecord(
            provider="test-provider-c",
            model_id="test-llm",
            display_name="Test LLM",
            tier=ModelTier.LLM,
            context_window=32768,
            max_output_tokens=4096,
            pricing=ModelPricing(
                input_per_1m_tokens=1.00,
                output_per_1m_tokens=2.00,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                reasoning=True,
                code=True,
                streaming=True,
                tool_use=True,
            ),
            latency_ms=300.0,
            quality_score=0.98,
        )
    )

    return registry


async def main() -> None:
    registry = build_registry()

    routing_engine = RoutingEngine(
        registry=registry,
    )

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Write Python code.",
            }
        ],
        objective=RoutingObjective.QUALITY,
        required_capabilities=("code",),
        stream=True,
    )

    candidates = await routing_engine.get_candidates(request)

    assert len(candidates) == 3

    decision = await routing_engine.route(request)

    assert decision.status.value == "selected"
    assert decision.model_id == "test-llm"
    assert decision.provider == "test-provider-c"
    assert decision.tier == "llm"
    assert decision.candidates_considered == 3

    slm_request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Write Python code.",
            }
        ],
        objective=RoutingObjective.COST,
        preferred_tier="slm",
        required_capabilities=("code",),
    )

    slm_decision = await routing_engine.route(
        slm_request,
    )

    assert slm_decision.model_id == "test-slm"
    assert slm_decision.tier == "slm"

    no_route_request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Generate an image.",
            }
        ],
        required_capabilities=("vision",),
    )

    try:
        await routing_engine.route(no_route_request)
    except NoRouteAvailableError:
        pass
    else:
        raise AssertionError(
            "Expected NoRouteAvailableError."
        )

    print("ROUTING ENGINE: PASS")
    print(f"CANDIDATES: {len(candidates)}")
    print(f"QUALITY ROUTE: {decision.model_id}")
    print(f"QUALITY PROVIDER: {decision.provider}")
    print(f"SLM COST ROUTE: {slm_decision.model_id}")
    print("NO ROUTE HANDLING: PASS")


if __name__ == "__main__":
    asyncio.run(main())
