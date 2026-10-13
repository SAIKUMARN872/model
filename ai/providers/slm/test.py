from __future__ import annotations

import asyncio

from ai.providers.slm import (
    GemmaProvider,
    LlamaProvider,
    MistralProvider,
    PhiProvider,
    QwenProvider,
    SLMProviderRegistry,
    SmolLMProvider,
    TinyLlamaProvider,
)
from ai.providers.slm.selector import SLMSelector
from ai.providers.base.models import ModelCapability, ProviderTier


def get_provider_metadata(provider):
    """Support both property-style and method-style metadata."""
    metadata = provider.metadata

    if callable(metadata):
        metadata = metadata()

    return metadata


async def main() -> None:
    print("=" * 90)
    print("MODELNOW SLM PROVIDER INTEGRATION TEST")
    print("=" * 90)

    providers = [
        GemmaProvider(),
        LlamaProvider(),
        MistralProvider(),
        PhiProvider(),
        QwenProvider(),
        SmolLMProvider(),
        TinyLlamaProvider(),
    ]

    registry = SLMProviderRegistry()

    # ------------------------------------------------------------------
    # TEST 1 - PROVIDER REGISTRATION
    # ------------------------------------------------------------------
    for provider in providers:
        registry.register(provider)

    assert registry.count() == 7

    expected_providers = {
        "gemma",
        "llama",
        "mistral",
        "phi",
        "qwen",
        "smollm",
        "tinyllama",
    }

    assert set(registry.provider_ids()) == expected_providers

    print("TEST 1 - PROVIDER REGISTRATION: PASS")
    print("  providers=7")

    # ------------------------------------------------------------------
    # TEST 2 - PROVIDER INITIALIZATION
    # ------------------------------------------------------------------
    for provider in providers:
        await provider.initialize()
        assert provider.initialized is True

    print("TEST 2 - PROVIDER INITIALIZATION: PASS")

    # ------------------------------------------------------------------
    # TEST 3 - PROVIDER HEALTH
    # ------------------------------------------------------------------
    for provider in providers:
        health = await provider.health_check()

        assert health.healthy is True
        assert health.provider
        assert health.status.value == "ready"

    print("TEST 3 - PROVIDER HEALTH: PASS")

    # ------------------------------------------------------------------
    # TEST 4 - MODEL DISCOVERY
    # ------------------------------------------------------------------
    all_models = await registry.list_models()

    assert len(all_models) == 11

    for model in all_models:
        assert model.tier == ProviderTier.SLM
        assert model.provider in expected_providers
        assert model.id
        assert model.context_window > 0
        assert model.quality_score is not None

    print("TEST 4 - MODEL DISCOVERY: PASS")
    print(f"  models={len(all_models)}")

    # ------------------------------------------------------------------
    # TEST 5 - PROVIDER MODEL INDEXING
    # ------------------------------------------------------------------
    expected_model_counts = {
        "gemma": 2,
        "llama": 2,
        "mistral": 1,
        "phi": 1,
        "qwen": 2,
        "smollm": 2,
        "tinyllama": 1,
    }

    for provider_id, expected_count in expected_model_counts.items():
        provider = registry.require(provider_id)
        models = await provider.list_models()

        assert len(models) == expected_count

        for model in models:
            assert model.provider == provider_id
            assert model.tier == ProviderTier.SLM

    print("TEST 5 - PROVIDER MODEL INDEXING: PASS")

    # ------------------------------------------------------------------
    # TEST 6 - MODEL LOOKUP
    # ------------------------------------------------------------------
    qwen_model = await registry.find_model(
        "Qwen/Qwen2.5-0.5B-Instruct"
    )

    assert qwen_model is not None
    assert qwen_model.provider == "qwen"

    tinyllama_model = await registry.find_model(
        "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    )

    assert tinyllama_model is not None
    assert tinyllama_model.provider == "tinyllama"

    print("TEST 6 - MODEL LOOKUP: PASS")

    # ------------------------------------------------------------------
    # TEST 7 - PROVIDER MODEL RESOLUTION
    # ------------------------------------------------------------------
    qwen_provider = await registry.provider_for_model(
        "Qwen/Qwen2.5-0.5B-Instruct"
    )

    assert qwen_provider is not None
    assert qwen_provider.config.provider_id.lower() == "qwen"

    llama_provider = await registry.provider_for_model(
        "meta-llama/Llama-3.2-1B-Instruct"
    )

    assert llama_provider is not None
    assert llama_provider.config.provider_id.lower() == "llama"

    print("TEST 7 - PROVIDER MODEL RESOLUTION: PASS")

    # ------------------------------------------------------------------
    # TEST 8 - MODEL ALIAS SUPPORT
    # ------------------------------------------------------------------
    alias_checks = 0

    for provider in providers:
        models = await provider.list_models()

        for model in models:
            for alias in model.aliases:
                assert await provider.supports_model(alias) is True
                alias_checks += 1

    print("TEST 8 - MODEL ALIAS SUPPORT: PASS")
    print(f"  aliases_checked={alias_checks}")

    # ------------------------------------------------------------------
    # TEST 9 - SLM SELECTOR
    # ------------------------------------------------------------------
    selector = SLMSelector()

    ranked = selector.rank(all_models)

    assert ranked
    assert all(
        item.model.tier == ProviderTier.SLM
        for item in ranked
    )

    selected = selector.select(all_models)

    assert selected is not None
    assert selected.model.tier == ProviderTier.SLM
    assert 0.0 <= selected.score <= 1.0

    print("TEST 9 - SLM SELECTOR: PASS")
    print(
        "  selected="
        f"{selected.model.id}"
        f" provider={selected.model.provider}"
        f" score={selected.score:.4f}"
    )

    # ------------------------------------------------------------------
    # TEST 10 - CAPABILITY FILTERING
    # ------------------------------------------------------------------
    code_ranked = selector.rank(
        all_models,
        capability=ModelCapability.CODE,
    )

    assert code_ranked

    for item in code_ranked:
        assert item.model.supports(
            ModelCapability.CODE
        )

    print("TEST 10 - CAPABILITY FILTERING: PASS")
    print(f"  code_candidates={len(code_ranked)}")

    # ------------------------------------------------------------------
    # TEST 11 - MODEL ID CONSTRAINED SELECTION
    # ------------------------------------------------------------------
    constrained = selector.select(
        all_models,
        model_id="Qwen/Qwen2.5-0.5B-Instruct",
    )

    assert constrained is not None
    assert (
        constrained.model.id
        == "Qwen/Qwen2.5-0.5B-Instruct"
    )
    assert constrained.model.provider == "qwen"

    print("TEST 11 - CONSTRAINED SLM SELECTION: PASS")

    # ------------------------------------------------------------------
    # TEST 12 - PROVIDER METADATA
    # ------------------------------------------------------------------
    for provider in providers:
        metadata = get_provider_metadata(provider)

        assert metadata.provider_id
        assert metadata.display_name
        assert metadata.enterprise_ready is True
        assert metadata.streaming_supported is True
        assert ProviderTier.SLM in metadata.tier_support

    print("TEST 12 - PROVIDER METADATA: PASS")

    # ------------------------------------------------------------------
    # TEST 13 - PROVIDER SHUTDOWN
    # ------------------------------------------------------------------
    for provider in providers:
        await provider.close()
        assert provider.initialized is False

    print("TEST 13 - PROVIDER SHUTDOWN: PASS")

    # ------------------------------------------------------------------
    # FINAL
    # ------------------------------------------------------------------
    print("=" * 90)
    print("MODELNOW SLM PROVIDER INTEGRATION: PASS")
    print("=" * 90)


if __name__ == "__main__":
    asyncio.run(main())
