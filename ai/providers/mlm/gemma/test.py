from __future__ import annotations

import asyncio

from ai.providers.base.config import ProviderConfig
from ai.providers.base.models import (
    ModelCapability,
    ProviderStatus,
    ProviderTier,
)
from ai.providers.base.request import ChatMessage, ChatRequest

from ai.providers.mlm.gemma import (
    DEFAULT_GEMMA_MODELS,
    GemmaConfig,
    GemmaProvider,
)


async def main() -> None:
    print("=" * 80)
    print("MODELNOW GEMMA MLM PROVIDER TEST")
    print("=" * 80)

    config = GemmaConfig(
        model_id="google/gemma-3-4b-it",
    )

    provider = GemmaProvider(
        config=config.provider_config(),
        gemma_config=config,
    )

    assert provider.name == "gemma"
    assert provider.version == "1.0.0"

    print("TEST 1 - PROVIDER CREATION: PASS")

    metadata = provider.metadata

    assert metadata.provider_id == "gemma"
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
    assert health.status == ProviderStatus.READY

    print("TEST 4 - PROVIDER HEALTH: PASS")

    models = await provider.list_models()

    assert len(models) == len(DEFAULT_GEMMA_MODELS)
    assert all(
        model.provider == "gemma"
        for model in models
    )
    assert all(
        model.tier == ProviderTier.MLM
        for model in models
    )

    print("TEST 5 - MODEL DISCOVERY: PASS")
    print(f"  models={len(models)}")

    model = models[0]

    assert model.id == "google/gemma-3-4b-it"
    assert model.context_window == 131072
    assert model.max_output_tokens == 8192

    print("TEST 6 - MODEL METADATA: PASS")

    assert await provider.supports_model(
        "google/gemma-3-4b-it"
    )

    assert await provider.supports_model(
        "gemma-3-4b-it"
    )

    assert not await provider.supports_model(
        "unknown-gemma-model"
    )

    print("TEST 7 - MODEL + ALIAS SUPPORT: PASS")

    request = ChatRequest(
        model="google/gemma-3-4b-it",
        messages=[
            ChatMessage(
                role="user",
                content="Hello Gemma",
            )
        ],
        temperature=0.2,
        max_tokens=32,
    )

    assert request.model == "google/gemma-3-4b-it"
    assert request.message_count == 1

    print("TEST 8 - CHAT REQUEST CONTRACT: PASS")

    assert provider.client.closed is False

    await provider.close()

    assert not provider.initialized
    assert provider.client.closed

    print("TEST 9 - PROVIDER SHUTDOWN: PASS")

    print()
    print("MODELNOW GEMMA MLM PROVIDER: PASS")


if __name__ == "__main__":
    asyncio.run(main())
