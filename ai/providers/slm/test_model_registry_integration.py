import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from ai.model_registry import ModelRegistryEngine
from ai.model_registry.utils import model_info_to_record
from ai.providers.slm import (
    GemmaProvider,
    LlamaProvider,
    MistralProvider,
    SLMProviderRegistry,
)


def main() -> None:
    provider_registry = SLMProviderRegistry()

    provider_registry.register_many(
        [
            GemmaProvider(),
            LlamaProvider(),
            MistralProvider(),
        ]
    )

    model_registry = ModelRegistryEngine()

    registered = 0

    for provider in provider_registry.providers():
        provider_id = provider.config.provider_id

        if provider_id == "gemma":
            from ai.providers.slm.gemma.models import GEMMA_MODELS

            models = GEMMA_MODELS

        elif provider_id == "llama":
            from ai.providers.slm.llama.models import LLAMA_MODELS

            models = LLAMA_MODELS

        elif provider_id == "mistral":
            from ai.providers.slm.mistral.models import MISTRAL_MODELS

            models = MISTRAL_MODELS

        else:
            models = []

        for model in models:
            record = model_info_to_record(model)

            model_registry.register(record)

            registered += 1

            print(
                "REGISTERED:",
                record.qualified_id,
                "| TIER:",
                record.tier.value,
                "| CONTEXT:",
                record.context_window,
                "| QUALITY:",
                record.quality_score,
            )

    print("PROVIDERS:", model_registry.providers())
    print("TOTAL REGISTERED:", registered)
    print("REGISTRY COUNT:", model_registry.count())

    assert registered == 5
    assert model_registry.count() == 5

    assert "gemma" in model_registry.providers()
    assert "llama" in model_registry.providers()
    assert "mistral" in model_registry.providers()

    canonical_models = model_registry.list_models()

    gemma = next(
        (
            model
            for model in canonical_models
            if model.model_id == "google/gemma-3-1b-it"
        ),
        None,
    )

    llama = next(
        (
            model
            for model in canonical_models
            if model.model_id
            == "meta-llama/Llama-3.2-1B-Instruct"
        ),
        None,
    )

    mistral = next(
        (
            model
            for model in canonical_models
            if model.model_id
            == "mistralai/Mistral-7B-Instruct-v0.3"
        ),
        None,
    )

    assert gemma is not None
    assert llama is not None
    assert mistral is not None

    assert gemma.provider == "gemma"
    assert llama.provider == "llama"
    assert mistral.provider == "mistral"

    assert gemma.tier.value == "slm"
    assert llama.tier.value == "slm"
    assert mistral.tier.value == "slm"

    print("GEMMA CANONICAL RECORD: PASS")
    print("LLAMA CANONICAL RECORD: PASS")
    print("MISTRAL CANONICAL RECORD: PASS")
    print("SLM → MODEL REGISTRY TEST: PASS")


if __name__ == "__main__":
    main()
