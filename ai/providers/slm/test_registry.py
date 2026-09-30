import asyncio

from ai.providers.slm import (
    GemmaProvider,
    LlamaProvider,
    MistralProvider,
    PhiProvider,
    SLMProviderRegistry,
)


async def main() -> None:
    registry = SLMProviderRegistry()

    registry.register_many(
        [
            GemmaProvider(),
            LlamaProvider(),
            MistralProvider(),
            PhiProvider(),
        ]
    )

    providers = registry.providers()
    models = await registry.list_models()

    print("PROVIDER COUNT:", registry.count())
    print("PROVIDERS:", registry.provider_ids())
    print("MODEL COUNT:", len(models))

    for model in models:
        print(
            "MODEL:",
            model.id,
            "| PROVIDER:",
            model.provider,
            "| TIER:",
            model.tier,
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

    print("GEMMA FOUND:", gemma is not None)
    print("LLAMA FOUND:", llama is not None)
    print("MISTRAL FOUND:", mistral is not None)
    print("PHI FOUND:", phi is not None)

    llama_provider = await registry.provider_for_model(
        "meta-llama/Llama-3.2-1B-Instruct"
    )
    mistral_provider = await registry.provider_for_model(
        "mistralai/Mistral-7B-Instruct-v0.3"
    )
    phi_provider = await registry.provider_for_model(
        "microsoft/Phi-3-mini-4k-instruct"
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

    print("SLM REGISTRY TEST: PASS")


asyncio.run(main())
