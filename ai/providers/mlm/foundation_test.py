from __future__ import annotations

import asyncio

from ai.providers.base.config import ProviderConfig
from ai.providers.base.models import (
    ModelCapability,
    ModelInfo,
    ProviderHealth,
    ProviderStatus,
    ProviderTier,
)
from ai.providers.base.provider import BaseProvider
from ai.providers.base.request import ChatMessage, ChatRequest
from ai.providers.base.response import ChatResponse

from ai.providers.mlm.common import (
    capability_names,
    enabled_models,
    find_model,
    model_matches,
    models_with_capability,
    normalize_model_id,
    request_metadata,
    validate_chat_request,
)
from ai.providers.mlm.registry import MLMProviderRegistry
from ai.providers.mlm.selector import MLMSelector


class FakeMLMProvider(BaseProvider):
    name = "fake-mlm"

    def __init__(self) -> None:
        super().__init__(
            ProviderConfig(provider_id="fake-mlm")
        )

    async def initialize(self) -> None:
        self.ensure_enabled()
        self._initialized = True

    async def close(self) -> None:
        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        return ProviderHealth(
            healthy=True,
            provider=self.name,
            status=ProviderStatus.READY,
        )

    async def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(
                id="fake-mlm-fast",
                provider="fake-mlm",
                aliases=("fast-mlm",),
                tier=ProviderTier.MLM,
                capabilities=frozenset(
                    {
                        ModelCapability.CHAT,
                        ModelCapability.CODE,
                        ModelCapability.STREAMING,
                    }
                ),
                context_window=32768,
                max_output_tokens=8192,
                input_cost_per_1m_tokens=1.0,
                output_cost_per_1m_tokens=2.0,
                estimated_latency_ms=100.0,
                quality_score=0.85,
            ),
            ModelInfo(
                id="fake-mlm-quality",
                provider="fake-mlm",
                aliases=("quality-mlm",),
                tier=ProviderTier.MLM,
                capabilities=frozenset(
                    {
                        ModelCapability.CHAT,
                        ModelCapability.REASONING,
                        ModelCapability.CODE,
                    }
                ),
                context_window=65536,
                max_output_tokens=16384,
                input_cost_per_1m_tokens=5.0,
                output_cost_per_1m_tokens=8.0,
                estimated_latency_ms=300.0,
                quality_score=0.97,
            ),
            ModelInfo(
                id="disabled-mlm",
                provider="fake-mlm",
                tier=ProviderTier.MLM,
                enabled=False,
                quality_score=1.0,
            ),
        ]

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.ensure_enabled()
        self.ensure_initialized()

        return ChatResponse(
            provider=self.name,
            model=request.model,
            content="fake response",
        )

    async def supports_model(
        self,
        model_id: str,
    ) -> bool:
        return any(
            model.matches(model_id)
            for model in await self.list_models()
        )


def build_models() -> list[ModelInfo]:
    return [
        ModelInfo(
            id="mlm-fast",
            provider="test",
            aliases=("fast",),
            tier=ProviderTier.MLM,
            capabilities=frozenset(
                {
                    ModelCapability.CHAT,
                    ModelCapability.CODE,
                }
            ),
            estimated_latency_ms=80.0,
            quality_score=0.84,
            input_cost_per_1m_tokens=1.0,
            output_cost_per_1m_tokens=2.0,
        ),
        ModelInfo(
            id="mlm-quality",
            provider="test",
            aliases=("quality",),
            tier=ProviderTier.MLM,
            capabilities=frozenset(
                {
                    ModelCapability.CHAT,
                    ModelCapability.REASONING,
                    ModelCapability.CODE,
                }
            ),
            estimated_latency_ms=250.0,
            quality_score=0.96,
            input_cost_per_1m_tokens=6.0,
            output_cost_per_1m_tokens=8.0,
        ),
        ModelInfo(
            id="slm-model",
            provider="test",
            tier=ProviderTier.SLM,
            quality_score=0.99,
        ),
        ModelInfo(
            id="disabled-mlm",
            provider="test",
            tier=ProviderTier.MLM,
            enabled=False,
            quality_score=1.0,
        ),
    ]


async def main() -> None:
    print("=" * 80)
    print("MODELNOW MLM FOUNDATION TEST")
    print("=" * 80)

    models = build_models()

    normalized = normalize_model_id("  MLM-FAST  ")
    assert normalized == "mlm-fast"
    print("TEST 1 - MODEL ID NORMALIZATION: PASS")

    assert model_matches(models[0], "FAST")
    assert find_model(models, "quality") is models[1]
    print("TEST 2 - MODEL MATCHING + LOOKUP: PASS")

    enabled = enabled_models(models)
    assert len(enabled) == 3
    assert all(model.enabled for model in enabled)
    print("TEST 3 - ENABLED MODEL FILTERING: PASS")

    code_models = models_with_capability(
        models,
        ModelCapability.CODE,
    )
    assert len(code_models) == 2
    print("TEST 4 - CAPABILITY FILTERING: PASS")

    names = capability_names(
        {
            ModelCapability.CODE,
            ModelCapability.CHAT,
            ModelCapability.REASONING,
        }
    )
    assert names == ("chat", "code", "reasoning")
    print("TEST 5 - CAPABILITY NORMALIZATION: PASS")

    request = ChatRequest(
        model="mlm-fast",
        messages=[
            ChatMessage(
                role="user",
                content="Hello",
            )
        ],
        temperature=0.2,
        max_tokens=100,
    )

    validate_chat_request(request)

    metadata = request_metadata(request)

    assert metadata["model"] == "mlm-fast"
    assert metadata["message_count"] == 1
    assert metadata["max_tokens"] == 100

    print("TEST 6 - CHAT REQUEST VALIDATION: PASS")

    selector = MLMSelector()

    candidates = selector.candidates(models)

    assert len(candidates) == 2
    assert all(
        model.tier == ProviderTier.MLM
        for model in candidates
    )

    ranked = selector.rank(models)

    assert len(ranked) == 2
    assert ranked[0].score >= ranked[1].score

    selected = selector.select(models)

    assert selected is not None
    assert selected.model.tier == ProviderTier.MLM

    print("TEST 7 - MLM SELECTOR: PASS")
    print(
        f"  selected={selected.model.id} "
        f"score={selected.score:.4f}"
    )

    constrained = selector.select(
        models,
        model_id="QUALITY",
    )

    assert constrained is not None
    assert constrained.model.id == "mlm-quality"

    print("TEST 8 - CONSTRAINED MLM SELECTION: PASS")

    registry = MLMProviderRegistry()

    provider = FakeMLMProvider()

    registry.register(provider)

    assert registry.count() == 1
    assert registry.get("FAKE-MLM") is provider
    assert registry.require("fake-mlm") is provider

    print("TEST 9 - MLM PROVIDER REGISTRATION: PASS")

    await provider.initialize()

    assert provider.initialized

    registered_models = await registry.list_models()

    assert len(registered_models) == 3

    print("TEST 10 - MLM MODEL DISCOVERY: PASS")
    print(
        f"  models={len(registered_models)}"
    )

    found = await registry.find_model("FAST-MLM")

    assert found is not None
    assert found.id == "fake-mlm-fast"

    print("TEST 11 - MLM MODEL ALIAS LOOKUP: PASS")

    resolved_provider = await registry.provider_for_model(
        "quality-mlm"
    )

    assert resolved_provider is provider

    print("TEST 12 - PROVIDER MODEL RESOLUTION: PASS")

    health = await provider.health_check()

    assert health.healthy
    assert health.status == ProviderStatus.READY

    print("TEST 13 - PROVIDER HEALTH: PASS")

    await provider.close()

    assert not provider.initialized

    registry.clear()

    assert registry.count() == 0

    print("TEST 14 - PROVIDER SHUTDOWN + REGISTRY CLEAR: PASS")

    print()
    print("MODELNOW MLM FOUNDATION: PASS")


if __name__ == "__main__":
    asyncio.run(main())
