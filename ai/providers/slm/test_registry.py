import asyncio
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from ai.providers.slm import (
    GemmaProvider,
    LlamaProvider,
    MistralProvider,
    SLMProviderRegistry,
)


async def main() -> None:
    registry = SLMProviderRegistry()

    registry.register_many(
        [
            GemmaProvider(),
            LlamaProvider(),
            MistralProvider(),
        ]
    )

    print("PROVIDER COUNT:", registry.count())
    print("PROVIDERS:", registry.provider_ids())

    models = await registry.list_models()

    print("MODEL COUNT:", len(models))

    for model in models:
        print(
            "MODEL:",
            model.id,
            "| PROVIDER:",
            model.provider,
            "| TIER:",
            model.tier.value,
        )

    gemma = await registry.find_model(
        "google/gemma-3-1b-it"
    )

    llama = await registry.find_model(
        "meta-llama/Llama-3.2-1B-Instruct"
    )

    mistral = await registry.find_model(
        "mistralai/Mistral-7B-Instruct-v0.3"
    )

    llama_provider = await registry.provider_for_model(
        "meta-llama/Llama-3.2-1B-Instruct"
    )

    mistral_provider = await registry.provider_for_model(
        "mistralai/Mistral-7B-Instruct-v0.3"
    )

    print("GEMMA FOUND:", gemma is not None)
    print("LLAMA FOUND:", llama is not None)
    print("MISTRAL FOUND:", mistral is not None)

    print(
        "LLAMA PROVIDER:",
        llama_provider.config.provider_id
        if llama_provider
        else None,
    )

    print(
        "MISTRAL PROVIDER:",
        mistral_provider.config.provider_id
        if mistral_provider
        else None,
    )

    assert registry.count() == 3
    assert set(registry.provider_ids()) == {
        "gemma",
        "llama",
        "mistral",
    }

    assert len(models) == 5

    assert gemma is not None
    assert llama is not None
    assert mistral is not None

    assert gemma.provider == "gemma"
    assert llama.provider == "llama"
    assert mistral.provider == "mistral"

    assert gemma.tier.value == "slm"
    assert llama.tier.value == "slm"
    assert mistral.tier.value == "slm"

    assert llama_provider is not None
    assert llama_provider.config.provider_id == "llama"

    assert mistral_provider is not None
    assert mistral_provider.config.provider_id == "mistral"

    print("SLM REGISTRY TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())
