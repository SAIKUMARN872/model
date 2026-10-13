from __future__ import annotations

from ai.model_registry.engine import ModelRegistryEngine
from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)


def build_models() -> list[ModelRecord]:
    return [
        ModelRecord(
            provider="provider-slm",
            model_id="qwen-0.5b",
            display_name="Qwen 0.5B Instruct",
            tier=ModelTier.SLM,
            context_window=32768,
            max_output_tokens=4096,
            pricing=ModelPricing(
                input_per_1m_tokens=0.002,
                output_per_1m_tokens=0.003,
                currency="USD",
            ),
            capabilities=ModelCapabilities(
                chat=True,
                reasoning=False,
                code=True,
                vision=False,
                audio=False,
                tool_use=True,
                structured_output=True,
                streaming=True,
                long_context=False,
                agentic=False,
            ),
            latency_ms=120.0,
            quality_score=0.82,
            aliases=(
                "qwen-small",
                "qwen-slm",
            ),
            enabled=True,
            available=True,
            version="1.0",
            metadata={
                "source": "integration-test",
                "family": "qwen",
            },
        ),
        ModelRecord(
            provider="provider-mlm",
            model_id="model-balanced",
            display_name="Model Balanced",
            tier=ModelTier.MLM,
            context_window=131072,
            max_output_tokens=8192,
            pricing=ModelPricing(
                input_per_1m_tokens=0.006,
                output_per_1m_tokens=0.008,
                currency="USD",
            ),
            capabilities=ModelCapabilities(
                chat=True,
                reasoning=True,
                code=True,
                vision=True,
                audio=False,
                tool_use=True,
                structured_output=True,
                streaming=True,
                long_context=True,
                agentic=True,
            ),
            latency_ms=180.0,
            quality_score=0.90,
            aliases=(
                "balanced",
                "model-mlm",
            ),
            enabled=True,
            available=True,
            version="2.0",
            metadata={
                "source": "integration-test",
                "family": "balanced",
            },
        ),
        ModelRecord(
            provider="provider-llm",
            model_id="model-premium",
            display_name="Model Premium",
            tier=ModelTier.LLM,
            context_window=200000,
            max_output_tokens=16384,
            pricing=ModelPricing(
                input_per_1m_tokens=0.015,
                output_per_1m_tokens=0.020,
                currency="USD",
            ),
            capabilities=ModelCapabilities(
                chat=True,
                reasoning=True,
                code=True,
                vision=True,
                audio=True,
                tool_use=True,
                structured_output=True,
                streaming=True,
                long_context=True,
                agentic=True,
            ),
            latency_ms=350.0,
            quality_score=0.97,
            aliases=(
                "premium",
                "model-llm",
            ),
            enabled=True,
            available=True,
            version="3.0",
            metadata={
                "source": "integration-test",
                "family": "premium",
            },
        ),
    ]


def main() -> None:
    registry = ModelRegistryEngine()

    models = build_models()

    # ================================================================
    # TEST 1 - MODEL REGISTRATION
    # ================================================================

    registered = registry.register_many(models)

    assert len(registered) == 3
    assert registry.count() == 3

    print("TEST 1 - MODEL REGISTRATION: PASS")
    print(f"  Registered models: {registry.count()}")

    # ================================================================
    # TEST 2 - MODEL TIERS
    # ================================================================

    slm = registry.get(
        "provider-slm",
        "qwen-0.5b",
    )

    mlm = registry.get(
        "provider-mlm",
        "model-balanced",
    )

    llm = registry.get(
        "provider-llm",
        "model-premium",
    )

    assert slm is not None
    assert mlm is not None
    assert llm is not None

    assert slm.tier == ModelTier.SLM
    assert mlm.tier == ModelTier.MLM
    assert llm.tier == ModelTier.LLM

    print("TEST 2 - SLM / MLM / LLM TIERS: PASS")
    print(
        f"  SLM={slm.model_id} "
        f"MLM={mlm.model_id} "
        f"LLM={llm.model_id}"
    )

    # ================================================================
    # TEST 3 - QUALIFIED ID LOOKUP
    # ================================================================

    qualified = registry.get_by_id(
        "provider-mlm:model-balanced"
    )

    assert qualified is not None
    assert qualified.provider == "provider-mlm"
    assert qualified.model_id == "model-balanced"

    # Registry lookup is case-insensitive.
    qualified_case = registry.get_by_id(
        "PROVIDER-MLM:MODEL-BALANCED"
    )

    assert qualified_case is qualified

    print("TEST 3 - QUALIFIED ID LOOKUP: PASS")

    # ================================================================
    # TEST 4 - MODEL NAME + ALIAS DISCOVERY
    # ================================================================

    by_id = registry.find("qwen-0.5b")

    assert len(by_id) == 1
    assert by_id[0] is slm

    by_display_name = registry.find(
        "Qwen 0.5B Instruct"
    )

    assert len(by_display_name) == 1
    assert by_display_name[0] is slm

    by_alias = registry.find("qwen-small")

    assert len(by_alias) == 1
    assert by_alias[0] is slm

    by_second_alias = registry.find("qwen-slm")

    assert len(by_second_alias) == 1
    assert by_second_alias[0] is slm

    print("TEST 4 - MODEL NAME + ALIAS DISCOVERY: PASS")

    # ================================================================
    # TEST 5 - MODEL CAPABILITIES
    # ================================================================

    assert slm.capabilities.chat
    assert slm.capabilities.code
    assert slm.capabilities.tool_use
    assert slm.capabilities.structured_output
    assert not slm.capabilities.vision

    assert mlm.capabilities.reasoning
    assert mlm.capabilities.vision
    assert mlm.capabilities.tool_use
    assert mlm.capabilities.agentic
    assert mlm.capabilities.long_context

    assert llm.capabilities.reasoning
    assert llm.capabilities.vision
    assert llm.capabilities.audio
    assert llm.capabilities.tool_use
    assert llm.capabilities.structured_output
    assert llm.capabilities.agentic

    print("TEST 5 - MODEL CAPABILITIES: PASS")

    # ================================================================
    # TEST 6 - PRICING
    # ================================================================

    assert slm.pricing.input_per_1m_tokens == 0.002
    assert slm.pricing.output_per_1m_tokens == 0.003
    assert slm.pricing.currency == "USD"

    assert mlm.pricing.input_per_1m_tokens == 0.006
    assert mlm.pricing.output_per_1m_tokens == 0.008

    assert llm.pricing.input_per_1m_tokens == 0.015
    assert llm.pricing.output_per_1m_tokens == 0.020

    print("TEST 6 - MODEL PRICING: PASS")
    print(
        f"  SLM input={slm.pricing.input_per_1m_tokens} "
        f"output={slm.pricing.output_per_1m_tokens}"
    )
    print(
        f"  MLM input={mlm.pricing.input_per_1m_tokens} "
        f"output={mlm.pricing.output_per_1m_tokens}"
    )
    print(
        f"  LLM input={llm.pricing.input_per_1m_tokens} "
        f"output={llm.pricing.output_per_1m_tokens}"
    )

    # ================================================================
    # TEST 7 - CONTEXT / OUTPUT / QUALITY / LATENCY
    # ================================================================

    assert slm.context_window == 32768
    assert slm.max_output_tokens == 4096
    assert slm.latency_ms == 120.0
    assert slm.quality_score == 0.82

    assert mlm.context_window == 131072
    assert mlm.max_output_tokens == 8192
    assert mlm.latency_ms == 180.0
    assert mlm.quality_score == 0.90

    assert llm.context_window == 200000
    assert llm.max_output_tokens == 16384
    assert llm.latency_ms == 350.0
    assert llm.quality_score == 0.97

    print(
        "TEST 7 - MODEL PERFORMANCE METADATA: PASS"
    )

    # ================================================================
    # TEST 8 - PROVIDER DISCOVERY
    # ================================================================

    providers = registry.providers()

    assert providers == {
        "provider-slm",
        "provider-mlm",
        "provider-llm",
    }

    print("TEST 8 - PROVIDER DISCOVERY: PASS")

    # ================================================================
    # TEST 9 - PROVIDER FILTERING
    # ================================================================

    provider_models = registry.manager.list_models(
        provider="provider-mlm"
    )

    assert len(provider_models) == 1
    assert provider_models[0] is mlm

    print("TEST 9 - PROVIDER FILTERING: PASS")

    # ================================================================
    # TEST 10 - ENABLED / AVAILABLE FILTERING
    # ================================================================

    disabled_model = ModelRecord(
        provider="provider-disabled",
        model_id="disabled-model",
        display_name="Disabled Model",
        tier=ModelTier.MLM,
        enabled=False,
        available=True,
    )

    unavailable_model = ModelRecord(
        provider="provider-unavailable",
        model_id="unavailable-model",
        display_name="Unavailable Model",
        tier=ModelTier.MLM,
        enabled=True,
        available=False,
    )

    registry.register(disabled_model)
    registry.register(unavailable_model)

    assert registry.count() == 5

    enabled_models = registry.manager.list_models(
        enabled_only=True
    )

    available_models = registry.manager.list_models(
        available_only=True
    )

    enabled_available_models = (
        registry.manager.list_models(
            enabled_only=True,
            available_only=True,
        )
    )

    assert len(enabled_models) == 4
    assert len(available_models) == 4
    assert len(enabled_available_models) == 3

    print(
        "TEST 10 - ENABLED / AVAILABLE FILTERING: PASS"
    )

    # ================================================================
    # TEST 11 - DUPLICATE REGISTRATION PROTECTION
    # ================================================================

    duplicate_detected = False

    try:
        registry.register(slm)
    except ValueError as exc:
        duplicate_detected = True
        assert "already registered" in str(exc).lower()

    assert duplicate_detected

    print(
        "TEST 11 - DUPLICATE REGISTRATION PROTECTION: PASS"
    )

    # ================================================================
    # TEST 12 - UPSERT
    # ================================================================

    updated_mlm = ModelRecord(
        provider="provider-mlm",
        model_id="model-balanced",
        display_name="Model Balanced Updated",
        tier=ModelTier.MLM,
        context_window=131072,
        max_output_tokens=12288,
        pricing=ModelPricing(
            input_per_1m_tokens=0.005,
            output_per_1m_tokens=0.007,
            currency="USD",
        ),
        capabilities=mlm.capabilities,
        latency_ms=160.0,
        quality_score=0.92,
        aliases=(
            "balanced",
            "model-mlm",
            "model-balanced-v2",
        ),
        enabled=True,
        available=True,
        version="2.1",
        metadata={
            "source": "integration-test",
            "updated": True,
        },
    )

    registry.manager.upsert(updated_mlm)

    refreshed_mlm = registry.get(
        "provider-mlm",
        "model-balanced",
    )

    assert refreshed_mlm is not None
    assert (
        refreshed_mlm.display_name
        == "Model Balanced Updated"
    )
    assert refreshed_mlm.max_output_tokens == 12288
    assert refreshed_mlm.pricing.input_per_1m_tokens == 0.005
    assert refreshed_mlm.quality_score == 0.92
    assert refreshed_mlm.version == "2.1"
    assert registry.count() == 5

    print("TEST 12 - UPSERT: PASS")

    # ================================================================
    # TEST 13 - INVALID MODEL TYPE
    # ================================================================

    invalid_type_detected = False

    try:
        registry.register(
            "not-a-model-record"  # type: ignore[arg-type]
        )
    except TypeError as exc:
        invalid_type_detected = True
        assert "model must be a ModelRecord" in str(exc)

    assert invalid_type_detected

    print("TEST 13 - INVALID MODEL TYPE: PASS")

    # ================================================================
    # TEST 14 - MODEL REMOVAL
    # ================================================================

    removed = registry.remove(
        "provider-disabled",
        "disabled-model",
    )

    assert removed is not None
    assert removed.model_id == "disabled-model"

    assert (
        registry.get(
            "provider-disabled",
            "disabled-model",
        )
        is None
    )

    assert registry.count() == 4

    print("TEST 14 - MODEL REMOVAL: PASS")

    # ================================================================
    # TEST 15 - MISSING MODEL LOOKUP
    # ================================================================

    assert (
        registry.get(
            "missing-provider",
            "missing-model",
        )
        is None
    )

    assert (
        registry.get_by_id(
            "missing-provider:missing-model"
        )
        is None
    )

    assert registry.find("does-not-exist") == []

    print("TEST 15 - MISSING MODEL HANDLING: PASS")

    # ================================================================
    # TEST 16 - CLEAR
    # ================================================================

    registry.clear()

    assert registry.count() == 0
    assert registry.list_models() == []
    assert registry.providers() == set()

    print("TEST 16 - REGISTRY CLEAR: PASS")

    # ================================================================
    # FINAL
    # ================================================================

    print()
    print("=" * 92)
    print("MODELNOW REAL MODEL REGISTRY INTEGRATION TEST: PASS")
    print("=" * 92)
    print(
        "Model Registry successfully validated:"
    )
    print("  model registration")
    print("  SLM / MLM / LLM tiers")
    print("  qualified model lookup")
    print("  model name discovery")
    print("  alias discovery")
    print("  model capabilities")
    print("  pricing metadata")
    print("  context and output limits")
    print("  quality and latency metadata")
    print("  provider discovery")
    print("  provider filtering")
    print("  enabled / available filtering")
    print("  duplicate protection")
    print("  model upsert")
    print("  invalid model protection")
    print("  model removal")
    print("  missing model handling")
    print("  registry clear")
    print("=" * 92)


if __name__ == "__main__":
    main()
