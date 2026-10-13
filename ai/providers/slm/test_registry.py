import asyncio

from ai.providers.slm import (
    GemmaProvider,
    LlamaProvider,
    MistralProvider,
    PhiProvider,
    QwenProvider,
    SmolLMProvider,
    TinyLlamaProvider,
)
from ai.providers.slm.registry import SLMProviderRegistry


async def main() -> None:
    registry = SLMProviderRegistry()

    registry.register_many(
        [
            GemmaProvider(),
            LlamaProvider(),
            MistralProvider(),
            PhiProvider(),
            QwenProvider(),
            SmolLMProvider(),
            TinyLlamaProvider(),
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
    phi = await registry.find_model(
        "microsoft/Phi-3-mini-4k-instruct"
    )
    qwen = await registry.find_model(
        "Qwen/Qwen2.5-0.5B-Instruct"
    )
    smollm = await registry.find_model(
        "HuggingFaceTB/SmolLM-135M-Instruct"
    )
    tinyllama = await registry.find_model(
        "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    )

    print("GEMMA FOUND:", gemma is not None)
    print("LLAMA FOUND:", llama is not None)
    print("MISTRAL FOUND:", mistral is not None)
    print("PHI FOUND:", phi is not None)
    print("QWEN FOUND:", qwen is not None)
    print("SMOLLM FOUND:", smollm is not None)
    print("TINYLLAMA FOUND:", tinyllama is not None)

    llama_provider = await registry.provider_for_model(
        "meta-llama/Llama-3.2-1B-Instruct"
    )

    mistral_provider = await registry.provider_for_model(
        "mistralai/Mistral-7B-Instruct-v0.3"
    )

    phi_provider = await registry.provider_for_model(
        "microsoft/Phi-3-mini-4k-instruct"
    )

    qwen_provider = await registry.provider_for_model(
        "Qwen/Qwen2.5-0.5B-Instruct"
    )

    smollm_provider = await registry.provider_for_model(
        "HuggingFaceTB/SmolLM-135M-Instruct"
    )

    tinyllama_provider = await registry.provider_for_model(
        "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    )

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
    print(
        "PHI PROVIDER:",
        phi_provider.config.provider_id
        if phi_provider
        else None,
    )
    print(
        "QWEN PROVIDER:",
        qwen_provider.config.provider_id
        if qwen_provider
        else None,
    )
    print(
        "SMOLLM PROVIDER:",
        smollm_provider.config.provider_id
        if smollm_provider
        else None,
    )
    print(
        "TINYLLAMA PROVIDER:",
        tinyllama_provider.config.provider_id
        if tinyllama_provider
        else None,
    )

    assert registry.count() == 7
    assert len(models) == 11

    assert gemma is not None
    assert llama is not None
    assert mistral is not None
    assert phi is not None
    assert qwen is not None
    assert smollm is not None
    assert tinyllama is not None

    assert llama_provider is not None
    assert mistral_provider is not None
    assert phi_provider is not None
    assert qwen_provider is not None
    assert smollm_provider is not None
    assert tinyllama_provider is not None

    assert qwen.provider == "qwen"
    assert qwen.tier.value == "slm"

    assert smollm.provider == "smollm"
    assert smollm.tier.value == "slm"

    assert tinyllama.provider == "tinyllama"
    assert tinyllama.tier.value == "slm"

    print("SLM REGISTRY TEST: PASS")


asyncio.run(main())
