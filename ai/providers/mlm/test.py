from __future__ import annotations

import asyncio

from .registry import MLMProviderRegistry
from .selector import MLMSelector

from .deepseek import DeepSeekProvider
from .mistral import MistralProvider
from .gemma import GemmaProvider
from .llama import LlamaProvider
from .qwen import QwenProvider
from .yi import YiProvider

from ..base.config import ProviderConfig
from ..base.models import (
    ModelCapability,
    ProviderStatus,
    ProviderTier,
)


async def main() -> None:
    print("=" * 88)
    print("MODELNOW MLM PROVIDER INTEGRATION TEST")
    print("=" * 88)

    providers = [
        DeepSeekProvider(
            config=ProviderConfig(
                provider_id="deepseek",
                enabled=True,
            )
        ),
        MistralProvider(
            config=ProviderConfig(
                provider_id="mistral",
                enabled=True,
            )
        ),
        GemmaProvider(
            config=ProviderConfig(
                provider_id="gemma",
                enabled=True,
            )
        ),
        LlamaProvider(
            config=ProviderConfig(
                provider_id="llama",
                enabled=True,
            )
        ),
        QwenProvider(
            config=ProviderConfig(
                provider_id="qwen",
                enabled=True,
            )
        ),
        YiProvider(
            config=ProviderConfig(
                provider_id="yi",
                enabled=True,
            )
        ),
    ]

    registry = MLMProviderRegistry()

    # TEST 1
    registry.register_many(providers)

    assert registry.count() == 6

    assert set(registry.provider_ids()) == {
        "deepseek",
        "mistral",
        "gemma",
        "llama",
        "qwen",
        "yi",
    }

    print("TEST 1 - PROVIDER REGISTRATION: PASS")
    print(f"  providers={registry.count()}")

    # TEST 2
    for provider in registry.providers():
        await provider.initialize()
        assert provider.initialized is True

    print("TEST 2 - PROVIDER INITIALIZATION: PASS")

    # TEST 3
    health_results = {}

    for provider in registry.providers():
        health = await provider.health_check()

        assert health.provider == provider.name

        assert health.status in {
            ProviderStatus.READY,
            ProviderStatus.UNAVAILABLE,
        }

        if health.status == ProviderStatus.READY:
            assert health.healthy is True
        else:
            assert health.healthy is False

        health_results[provider.name] = health

    assert len(health_results) == 6

    print("TEST 3 - PROVIDER HEALTH: PASS")

    ready_providers = [
        name
        for name, health in health_results.items()
        if health.status == ProviderStatus.READY
    ]

    unavailable_providers = [
        name
        for name, health in health_results.items()
        if health.status == ProviderStatus.UNAVAILABLE
    ]

    print(
        f"  ready={len(ready_providers)} "
        f"unavailable={len(unavailable_providers)}"
    )

    # TEST 4
    models = await registry.list_models()

    assert len(models) == 12
    assert all(model.tier == ProviderTier.MLM for model in models)
    assert all(model.enabled for model in models)

    providers_with_models = {
        model.provider
        for model in models
    }

    assert providers_with_models == {
        "deepseek",
        "mistral",
        "gemma",
        "llama",
        "qwen",
        "yi",
    }

    print("TEST 4 - MLM MODEL DISCOVERY: PASS")
    print(f"  models={len(models)}")

    # TEST 5
    model_ids = {
        model.id
        for model in models
    }

    expected_models = {
        "deepseek-v4-flash",
        "deepseek-v4-pro",
        "mistral-small-latest",
        "mistral-medium-latest",
        "google/gemma-3-4b-it",
        "google/gemma-3-12b-it",
        "meta-llama/Llama-3.1-8B-Instruct",
        "meta-llama/Llama-3.1-70B-Instruct",
        "Qwen/Qwen3-8B",
        "Qwen/Qwen3-14B",
        "01-ai/Yi-1.5-9B-Chat",
        "01-ai/Yi-1.5-34B-Chat",
    }

    assert model_ids == expected_models

    print("TEST 5 - MODEL INVENTORY: PASS")

    # TEST 6
    alias_checks = [
        ("deepseek-v4-flash", "deepseek"),
        ("mistral-small-latest", "mistral"),
        ("gemma-3-4b-it", "gemma"),
        ("llama-3.1-8b", "llama"),
        ("qwen3-8b", "qwen"),
        ("yi-1.5-9b", "yi"),
    ]

    for alias, expected_provider in alias_checks:
        model = await registry.find_model(alias)

        assert model is not None
        assert model.provider == expected_provider

    print("TEST 6 - MODEL ALIAS LOOKUP: PASS")
    print(f"  aliases_checked={len(alias_checks)}")

    # TEST 7
    resolution_checks = [
        ("deepseek-v4-pro", "deepseek"),
        ("mistral-medium-latest", "mistral"),
        ("google/gemma-3-12b-it", "gemma"),
        ("llama-70b", "llama"),
        ("Qwen/Qwen3-14B", "qwen"),
        ("yi-34b", "yi"),
    ]

    for model_id, expected_provider in resolution_checks:
        provider = await registry.provider_for_model(model_id)

        assert provider is not None
        assert provider.config.provider_id == expected_provider

    print("TEST 7 - PROVIDER MODEL RESOLUTION: PASS")

    # TEST 8
    code_models = [
        model
        for model in models
        if model.supports(ModelCapability.CODE)
    ]

    assert len(code_models) > 0
    assert all(
        model.tier == ProviderTier.MLM
        for model in code_models
    )

    print("TEST 8 - CAPABILITY FILTERING: PASS")
    print(f"  code_candidates={len(code_models)}")

    # TEST 9
    selector = MLMSelector()

    selection = selector.select(
        models,
        required_capabilities={
            ModelCapability.CODE,
        },
    )

    assert selection is not None
    assert selection.model.tier == ProviderTier.MLM
    assert selection.model.supports(ModelCapability.CODE)
    assert 0.0 <= selection.score <= 1.0

    print("TEST 9 - MLM SELECTOR: PASS")
    print(
        f"  selected={selection.model.id} "
        f"provider={selection.model.provider} "
        f"score={selection.score:.4f}"
    )

    # TEST 10
    constrained_model = await registry.find_model(
        "qwen3-8b"
    )

    assert constrained_model is not None

    constrained = selector.select(
        models,
        model_id=constrained_model.id,
    )

    assert constrained is not None
    assert constrained.model.id == constrained_model.id
    assert constrained.model.provider == "qwen"

    print("TEST 10 - CONSTRAINED MLM SELECTION: PASS")

    # TEST 11
    missing_model = await registry.find_model(
        "not-a-real-mlm"
    )

    assert missing_model is None

    missing_provider = await registry.provider_for_model(
        "not-a-real-mlm"
    )

    assert missing_provider is None

    print("TEST 11 - UNKNOWN MODEL HANDLING: PASS")

    # TEST 12
    for provider in registry.providers():
        await provider.close()
        assert provider.initialized is False

    print("TEST 12 - PROVIDER SHUTDOWN: PASS")

    # TEST 13
    registry.clear()

    assert registry.count() == 0
    assert registry.provider_ids() == []

    print("TEST 13 - REGISTRY CLEAR: PASS")

    print()
    print("MODELNOW MLM PROVIDER INTEGRATION: PASS")


if __name__ == "__main__":
    asyncio.run(main())
