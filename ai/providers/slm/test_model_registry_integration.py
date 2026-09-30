import asyncio

from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.utils import model_info_to_record
from ai.providers.slm import (
    GemmaProvider,
    LlamaProvider,
    MistralProvider,
    PhiProvider,
)


async def main() -> None:
    registry = ModelRegistryEngine()

    providers = [
        GemmaProvider(),
        LlamaProvider(),
        MistralProvider(),
        PhiProvider(),
    ]

    all_records = []

    for provider in providers:
        models = await provider.list_models()

        for model in models:
            all_records.append(
                model_info_to_record(model)
            )

    records = registry.register_many(all_records)

    for record in records:
        print(
            "REGISTERED:",
            record.qualified_id,
            "| TIER:",
            record.tier,
            "| CONTEXT:",
            record.context_window,
            "| QUALITY:",
            record.quality_score,
        )

    print("PROVIDERS:", registry.providers())
    print("TOTAL REGISTERED:", len(records))
    print("REGISTRY COUNT:", registry.count())

    gemma = registry.get(
        "gemma",
        "google/gemma-3-1b-it",
    )
    llama = registry.get(
        "llama",
        "meta-llama/Llama-3.2-1B-Instruct",
    )
    mistral = registry.get(
        "mistral",
        "mistralai/Mistral-7B-Instruct-v0.3",
    )
    phi = registry.get(
        "phi",
        "microsoft/Phi-3-mini-4k-instruct",
    )

    print(
        "GEMMA CANONICAL RECORD:",
        "PASS" if gemma is not None else "FAIL",
    )
    print(
        "LLAMA CANONICAL RECORD:",
        "PASS" if llama is not None else "FAIL",
    )
    print(
        "MISTRAL CANONICAL RECORD:",
        "PASS" if mistral is not None else "FAIL",
    )
    print(
        "PHI CANONICAL RECORD:",
        "PASS" if phi is not None else "FAIL",
    )

    assert gemma is not None
    assert llama is not None
    assert mistral is not None
    assert phi is not None

    assert phi.provider == "phi"
    assert phi.model_id == "microsoft/Phi-3-mini-4k-instruct"
    assert phi.tier.value == "slm"
    assert phi.context_window == 4096

    print("SLM ? MODEL REGISTRY TEST: PASS")


asyncio.run(main())
