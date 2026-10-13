from __future__ import annotations

import asyncio

from ...base.config import ProviderConfig
from ...base.models import (
    ModelCapability,
    ProviderStatus,
    ProviderTier,
)
from ...base.request import ChatMessage, ChatRequest

from .models import DEFAULT_YI_MODELS
from .provider import YiProvider


async def main() -> None:
    print("=" * 72)
    print("MODELNOW YI MLM PROVIDER TEST")
    print("=" * 72)

    config = ProviderConfig(
        provider_id="yi",
        enabled=True,
    )

    provider = YiProvider(config=config)

    # TEST 1
    assert provider.name == "yi"
    assert provider.config.provider_id == "yi"
    print("TEST 1 - PROVIDER CREATION: PASS")

    # TEST 2
    metadata = provider.metadata

    assert metadata.provider_id == "yi"
    assert metadata.display_name == "01.AI Yi"
    assert ProviderTier.MLM in metadata.tier_support
    assert metadata.enterprise_ready is True
    assert ModelCapability.CHAT in metadata.capabilities
    assert ModelCapability.CODE in metadata.capabilities
    assert ModelCapability.REASONING in metadata.capabilities

    print("TEST 2 - PROVIDER METADATA: PASS")

    # TEST 3
    await provider.initialize()

    assert provider.initialized is True

    print("TEST 3 - PROVIDER INITIALIZATION: PASS")

    # TEST 4
    health = await provider.health_check()

    assert health.healthy is True
    assert health.provider == "yi"
    assert health.status == ProviderStatus.READY

    print("TEST 4 - PROVIDER HEALTH: PASS")

    # TEST 5
    models = await provider.list_models()

    assert len(models) == 2
    assert all(model.provider == "yi" for model in models)
    assert all(model.tier == ProviderTier.MLM for model in models)

    print("TEST 5 - MODEL DISCOVERY: PASS")
    print(f"  models={len(models)}")

    # TEST 6
    first = models[0]
    second = models[1]

    assert first.id == "01-ai/Yi-1.5-9B-Chat"
    assert second.id == "01-ai/Yi-1.5-34B-Chat"

    assert first.context_window > 0
    assert second.context_window > 0

    assert first.quality_score is not None
    assert second.quality_score is not None

    print("TEST 6 - MODEL METADATA: PASS")

    # TEST 7
    assert await provider.supports_model(
        "01-ai/Yi-1.5-9B-Chat"
    )

    assert await provider.supports_model(
        "Yi-1.5-9B-Chat"
    )

    assert await provider.supports_model(
        "yi-1.5-9b"
    )

    assert await provider.supports_model(
        "01-AI/YI-1.5-34B-CHAT"
    )

    assert not await provider.supports_model(
        "unknown-model"
    )

    print("TEST 7 - MODEL + ALIAS SUPPORT: PASS")

    # TEST 8
    request = ChatRequest(
        model="01-ai/Yi-1.5-9B-Chat",
        messages=[
            ChatMessage(
                role="user",
                content="Explain ModelNow routing.",
            )
        ],
        max_tokens=32,
    )

    assert request.model == "01-ai/Yi-1.5-9B-Chat"
    assert request.message_count == 1
    assert request.max_tokens == 32

    print("TEST 8 - CHAT REQUEST CONTRACT: PASS")

    # TEST 9
    await provider.close()

    assert provider.initialized is False
    assert provider.client.closed is True

    print("TEST 9 - PROVIDER SHUTDOWN: PASS")
    print()
    print("MODELNOW YI MLM PROVIDER: PASS")


if __name__ == "__main__":
    asyncio.run(main())
