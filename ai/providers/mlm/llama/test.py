from __future__ import annotations

import asyncio

from ai.providers.base.models import (
    ModelCapability,
    ProviderStatus,
    ProviderTier,
)
from ai.providers.base.request import ChatMessage, ChatRequest

from ai.providers.mlm.llama import (
    DEFAULT_LLAMA_MODELS,
    LlamaConfig,
    LlamaProvider,
)


async def main() -> None:
    print("=" * 80)
    print("MODELNOW LLAMA MLM PROVIDER TEST")
    print("=" * 80)

    config = LlamaConfig(
        model_id="meta-llama/Llama-3.1-8B-Instruct",
    )

    provider = LlamaProvider(
        config=config.provider_config(),
        llama_config=config,
    )

    assert provider.name == "llama"
    assert provider.version == "1.0.0"

    print("TEST 1 - PROVIDER CREATION: PASS")

    metadata = provider.metadata

    assert metadata.provider_id == "llama"
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
    assert health.provider == "llama"
    assert health.status == ProviderStatus.READY

    print("TEST 4 - PROVIDER HEALTH: PASS")

    models = await provider.list_models()

    assert len(models) == len(DEFAULT_LLAMA_MODELS)
    assert len(models) == 2

    print("TEST 5 - MODEL DISCOVERY: PASS")
    print(f"  models={len(models)}")

    for model in models:
        assert model.provider == "llama"
        assert model.tier == ProviderTier.MLM
        assert model.context_window > 0
        assert model.max_output_tokens > 0
        assert model.quality_score is not None
        assert model.enabled

    print("TEST 6 - MODEL METADATA: PASS")

    assert await provider.supports_model(
        "meta-llama/Llama-3.1-8B-Instruct"
    )

    assert await provider.supports_model(
        "Llama-3.1-8B-Instruct"
    )

    assert await provider.supports_model(
        "llama-8b"
    )

    assert not await provider.supports_model(
        "unknown-llama-model"
    )

    print("TEST 7 - MODEL + ALIAS SUPPORT: PASS")

    request = ChatRequest(
        model="meta-llama/Llama-3.1-8B-Instruct",
        messages=[
            ChatMessage(
                role="user",
                content="Explain ModelNow briefly.",
            )
        ],
        temperature=0.2,
        max_tokens=64,
    )

    assert request.model == "meta-llama/Llama-3.1-8B-Instruct"
    assert request.message_count == 1
    assert request.temperature == 0.2
    assert request.max_tokens == 64

    print("TEST 8 - CHAT REQUEST CONTRACT: PASS")

    await provider.close()

    assert not provider.initialized
    assert provider.client.closed

    print("TEST 9 - PROVIDER SHUTDOWN: PASS")

    print()
    print("MODELNOW LLAMA MLM PROVIDER: PASS")


if __name__ == "__main__":
    asyncio.run(main())
