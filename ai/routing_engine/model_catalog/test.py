from __future__ import annotations

import asyncio

from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)
from ai.routing_engine.model_catalog import ModelRegistryCatalog
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
                input_per_1m_tokens=0.10,
                output_per_1m_tokens=0.20,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                code=True,
                streaming=True,
            ),
            latency_ms=100.0,
            quality_score=0.85,
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
                streaming=True,
            ),
            latency_ms=250.0,
            quality_score=0.92,
        )
    )

    return registry


async def main() -> None:
    registry = build_registry()
    catalog = ModelRegistryCatalog(registry)

    request = RoutingRequest(
        messages=[
            {
                "role": "user",
                "content": "Write Python code.",
            }
        ],
        preferred_tier="slm",
        required_capabilities=("code",),
        stream=True,
    )

    candidates = await catalog.candidates(request)

    assert len(candidates) == 1

    candidate = candidates[0]

    assert candidate.model_id == "test-slm"
    assert candidate.provider == "test-provider"
    assert candidate.tier == "slm"
    assert candidate.quality == 0.85
    assert "code" in candidate.capabilities
    assert "streaming" in candidate.capabilities

    print("MODEL REGISTRY → ROUTING ADAPTER: PASS")
    print(f"CANDIDATES: {len(candidates)}")
    print(f"MODEL: {candidate.model_id}")
    print(f"TIER: {candidate.tier}")
    print(f"CAPABILITIES: {candidate.capabilities}")


if __name__ == "__main__":
    asyncio.run(main())
