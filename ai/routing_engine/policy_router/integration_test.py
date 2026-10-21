from __future__ import annotations

import asyncio

from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)
from ai.routing_engine.engine import RoutingEngine
from ai.routing_engine.models import RoutingRequest


def build_registry() -> ModelRegistryEngine:
    registry = ModelRegistryEngine()

    registry.register(
        ModelRecord(
            provider="test-provider",
            model_id="test-slm",
            display_name="Test SLM",
            tier=ModelTier.SLM,
            context_window=4096,
            max_output_tokens=1024,
            pricing=ModelPricing(
                input_per_1m_tokens=0.0,
                output_per_1m_tokens=0.0,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                code=True,
                streaming=True,
            ),
            latency_ms=100.0,
            quality_score=0.82,
        )
    )

    registry.register(
        ModelRecord(
            provider="test-provider",
            model_id="test-mlm",
            display_name="Test MLM",
            tier=ModelTier.MLM,
            context_window=8192,
            max_output_tokens=2048,
            pricing=ModelPricing(
                input_per_1m_tokens=0.50,
                output_per_1m_tokens=1.00,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                reasoning=True,
                code=True,
                streaming=True,
            ),
            latency_ms=250.0,
            quality_score=0.92,
        )
    )

    return registry


async def test_classifier_policy_integration() -> None:
    engine = RoutingEngine(
        registry=build_registry()
    )

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Write Python code.",
            }
        ]
    )

    policy = engine.apply_policy(request)

    assert policy.allowed is True
    assert policy.preferred_tier == "mlm"

    candidates = await engine.get_candidates(request)

    assert len(candidates) == 1
    assert candidates[0].model_id == "test-mlm"


async def test_explicit_policy_overrides_inference() -> None:
    engine = RoutingEngine(
        registry=build_registry()
    )

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Analyze this problem.",
            }
        ],
        preferred_tier="mlm",
        min_quality=0.90,
    )

    policy = engine.apply_policy(request)

    assert policy.preferred_tier == "mlm"
    assert policy.min_quality == 0.90

    decision = await engine.route(request)

    assert decision.model_id == "test-mlm"
    assert decision.tier == "mlm"
    assert decision.metadata["policy_router_applied"] is True


async def test_streaming_policy() -> None:
    engine = RoutingEngine(
        registry=build_registry()
    )

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Explain AI.",
            }
        ],
        stream=True,
    )

    candidates = await engine.get_candidates(request)

    assert len(candidates) == 1
    assert candidates[0].model_id == "test-slm"


async def main() -> None:
    await test_classifier_policy_integration()
    print("CLASSIFIER → POLICY → CATALOG: PASS")

    await test_explicit_policy_overrides_inference()
    print("EXPLICIT POLICY PRECEDENCE: PASS")

    await test_streaming_policy()
    print("STREAMING POLICY → CATALOG: PASS")

    print("=" * 70)
    print("CLASSIFIER + POLICY ROUTER INTEGRATION: PASS")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())

