import asyncio

from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.utils import model_info_to_record

from ai.providers.slm import (
    GemmaProvider,
    LlamaProvider,
    MistralProvider,
    PhiProvider,
    QwenProvider,
    SmolLMProvider,
    TinyLlamaProvider,
)


async def main() -> None:
    registry = ModelRegistryEngine()

    providers = [
        GemmaProvider(),
        LlamaProvider(),
        MistralProvider(),
        PhiProvider(),
        QwenProvider(),
        SmolLMProvider(),
        TinyLlamaProvider(),
    ]

    all_records = []

    for provider in providers:
        models = await provider.list_models()

        for model in models:
            all_records.append(
                model_info_to_record(model)
            )

    records = registry.register_many(
        all_records
    )

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

    qwen = registry.get(
        "qwen",
        "Qwen/Qwen2.5-0.5B-Instruct",
    )

    smollm = registry.get(
        "smollm",
        "HuggingFaceTB/SmolLM-135M-Instruct",
    )

    tinyllama = registry.get(
        "tinyllama",
        "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
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

    print(
        "QWEN CANONICAL RECORD:",
        "PASS" if qwen is not None else "FAIL",
    )

    print(
        "SMOLLM CANONICAL RECORD:",
        "PASS" if smollm is not None else "FAIL",
    )

    print(
        "TINYLLAMA CANONICAL RECORD:",
        "PASS" if tinyllama is not None else "FAIL",
    )

    assert len(records) == 11
    assert registry.count() == 11

    assert gemma is not None
    assert llama is not None
    assert mistral is not None
    assert phi is not None
    assert qwen is not None
    assert smollm is not None
    assert tinyllama is not None

    assert qwen.provider == "qwen"
    assert qwen.model_id == (
        "Qwen/Qwen2.5-0.5B-Instruct"
    )
    assert qwen.tier.value == "slm"
    assert qwen.context_window == 32768

    assert smollm.provider == "smollm"
    assert smollm.model_id == (
        "HuggingFaceTB/SmolLM-135M-Instruct"
    )
    assert smollm.tier.value == "slm"
    assert smollm.context_window == 2048

    assert tinyllama.provider == "tinyllama"
    assert tinyllama.model_id == (
        "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    )
    assert tinyllama.tier.value == "slm"
    assert tinyllama.context_window == 2048

    print("SLM ? MODEL REGISTRY TEST: PASS")


asyncio.run(main())
