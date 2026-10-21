from __future__ import annotations

import asyncio

from ai.providers.base.models import (
    ModelCapability,
    ProviderStatus,
    ProviderTier,
)
from ai.providers.base.request import ChatMessage, ChatRequest

from ai.providers.mlm.qwen import (
    DEFAULT_QWEN_MODELS,
    QwenConfig,
    QwenProvider,
)


async def main() -> None:
    print("=" * 80)
    print("MODELNOW QWEN MLM PROVIDER TEST")
    print("=" * 80)

    config = QwenConfig(
        model_id="Qwen/Qwen3-8B",
    )

    provider = QwenProvider(
        config=config.provider_config(),
        qwen_config=config,
    )

    assert provider.name == "qwen"
    assert provider.version == "1.0.0"

    print("TEST 1 - PROVIDER CREATION: PASS")

    metadata = provider.metadata

    assert metadata.provider_id == "qwen"
    assert ProviderTier.MLM in metadata.tier_support
    assert ModelCapability.CHAT in metadata.capabilities
    assert ModelCapability.CODE in metadata.capabilities
    assert ModelCapability.REASONING in metadata.capabilities

    print("TEST 2 - PROVIDER METADATA: PASS")

    await provider.initialize()

    assert provider.initialized

    print("TEST 3 - PROVIDER INITIALIZATION: PASS")

    health = await provider.health_check()

    assert health.healthy
    assert health.provider == "qwen"
    assert health.status == ProviderStatus.READY

    print("TEST 4 - PROVIDER HEALTH: PASS")

    models = await provider.list_models()

    assert len(models) == len(DEFAULT_QWEN_MODELS)
    assert len(models) == 2

    print("TEST 5 - MODEL DISCOVERY: PASS")
    print(f"  models={len(models)}")

    for model in models:
        assert model.provider == "qwen"
        assert model.tier == ProviderTier.MLM
        assert model.context_window > 0
        assert model.max_output_tokens > 0
        assert model.quality_score is not None
        assert model.enabled

    print("TEST 6 - MODEL METADATA: PASS")

    assert await provider.supports_model(
        "Qwen/Qwen3-8B"
    )

    assert await provider.supports_model(
        "Qwen3-8B"
    )

    assert await provider.supports_model(
        "qwen-8b"
    )

    assert not await provider.supports_model(
        "unknown-qwen-model"
    )

    print("TEST 7 - MODEL + ALIAS SUPPORT: PASS")

    request = ChatRequest(
        model="Qwen/Qwen3-8B",
        messages=[
            ChatMessage(
                role="user",
                content="Explain ModelNow briefly.",
            )
        ],
        temperature=0.2,
        max_tokens=64,
    )

    assert request.model == "Qwen/Qwen3-8B"
    assert request.message_count == 1
    assert request.temperature == 0.2
    assert request.max_tokens == 64

    print("TEST 8 - CHAT REQUEST CONTRACT: PASS")

    await provider.close()

    assert not provider.initialized
    assert provider.client.closed

    print("TEST 9 - PROVIDER SHUTDOWN: PASS")

    print()
    print("MODELNOW QWEN MLM PROVIDER: PASS")


if __name__ == "__main__":
    asyncio.run(main())
