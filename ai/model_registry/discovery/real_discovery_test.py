from __future__ import annotations

from ai.model_registry.discovery.discovery import ModelDiscovery
from ai.model_registry.discovery.indexer import ModelDiscoveryIndex
from ai.model_registry.discovery.scanner import ModelScanner
from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)


class RealProviderSource:
    def __init__(
        self,
        provider: str,
        models: list[ModelRecord],
    ) -> None:
        self._provider = provider
        self._models = models
        self.discovery_calls = 0

    @property
    def provider(self) -> str:
        return self._provider

    def discover_models(self) -> list[ModelRecord]:
        self.discovery_calls += 1
        return list(self._models)


def build_sources() -> tuple[
    RealProviderSource,
    RealProviderSource,
    RealProviderSource,
]:
    slm_source = RealProviderSource(
        "provider-slm",
        [
            ModelRecord(
                provider="provider-slm",
                model_id="qwen-0.5b",
                display_name="Qwen 0.5B",
                tier=ModelTier.SLM,
                context_window=32768,
                max_output_tokens=4096,
                pricing=ModelPricing(
                    input_per_1m_tokens=0.002,
                    output_per_1m_tokens=0.003,
                ),
                capabilities=ModelCapabilities(
                    chat=True,
                    code=True,
                    streaming=True,
                ),
                latency_ms=100.0,
                quality_score=0.82,
                aliases=("qwen-small",),
                enabled=True,
                available=True,
                version="1.0",
            ),
            ModelRecord(
                provider="provider-slm",
                model_id="tiny-model",
                display_name="Tiny Model",
                tier=ModelTier.SLM,
                context_window=16384,
                max_output_tokens=2048,
                pricing=ModelPricing(
                    input_per_1m_tokens=0.001,
                    output_per_1m_tokens=0.002,
                ),
                capabilities=ModelCapabilities(
                    chat=True,
                    streaming=True,
                ),
                latency_ms=80.0,
                quality_score=0.76,
                enabled=True,
                available=True,
                version="1.0",
            ),
        ],
    )

    mlm_source = RealProviderSource(
        "provider-mlm",
        [
            ModelRecord(
                provider="provider-mlm",
                model_id="model-balanced",
                display_name="Balanced Model",
                tier=ModelTier.MLM,
                context_window=131072,
                max_output_tokens=8192,
                pricing=ModelPricing(
                    input_per_1m_tokens=0.006,
                    output_per_1m_tokens=0.008,
                ),
                capabilities=ModelCapabilities(
                    chat=True,
                    reasoning=True,
                    code=True,
                    vision=True,
                    tool_use=True,
                    structured_output=True,
                    streaming=True,
                    long_context=True,
                    agentic=True,
                ),
                latency_ms=180.0,
                quality_score=0.90,
                aliases=("balanced", "model-mid"),
                enabled=True,
                available=True,
                version="2.0",
            ),
        ],
    )

    llm_source = RealProviderSource(
        "provider-llm",
        [
            ModelRecord(
                provider="provider-llm",
                model_id="model-premium",
                display_name="Premium Model",
                tier=ModelTier.LLM,
                context_window=200000,
                max_output_tokens=16384,
                pricing=ModelPricing(
                    input_per_1m_tokens=0.015,
                    output_per_1m_tokens=0.020,
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
                latency_ms=400.0,
                quality_score=0.97,
                aliases=("premium", "model-best"),
                enabled=True,
                available=True,
                version="3.0",
            ),
        ],
    )

    return slm_source, mlm_source, llm_source


def main() -> None:
    slm_source, mlm_source, llm_source = build_sources()

    scanner = ModelScanner(
        [
            slm_source,
            mlm_source,
            llm_source,
        ]
    )

    discovery = ModelDiscovery(scanner)

    print("=" * 100)
    print("MODELNOW REAL MODEL DISCOVERY INTEGRATION TEST")
    print("=" * 100)

    # 1. Provider source registration
    sources = scanner.sources()

    assert len(sources) == 3
    assert {source.provider for source in sources} == {
        "provider-slm",
        "provider-mlm",
        "provider-llm",
    }

    print("TEST 1 - PROVIDER SOURCE REGISTRATION: PASS")
    print(f"  Sources: {[source.provider for source in sources]}")

    # 2. Multi-provider discovery
    discovered = discovery.discover()

    assert len(discovered) == 4
    assert discovery.count() == 4

    assert {model.provider for model in discovered} == {
        "provider-slm",
        "provider-mlm",
        "provider-llm",
    }

    print("TEST 2 - MULTI-PROVIDER DISCOVERY: PASS")
    print(f"  Discovered models: {len(discovered)}")

    # 3. Discovery source execution
    assert slm_source.discovery_calls == 1
    assert mlm_source.discovery_calls == 1
    assert llm_source.discovery_calls == 1

    print("TEST 3 - SOURCE SCANNING: PASS")

    # 4. Qualified model lookup
    qwen = discovery.get("provider-slm:qwen-0.5b")
    balanced = discovery.get("provider-mlm:model-balanced")
    premium = discovery.get("provider-llm:model-premium")

    assert qwen is not None
    assert balanced is not None
    assert premium is not None

    assert qwen.tier == ModelTier.SLM
    assert balanced.tier == ModelTier.MLM
    assert premium.tier == ModelTier.LLM

    print("TEST 4 - QUALIFIED MODEL LOOKUP: PASS")

    # 5. Provider indexing
    slm_models = discovery.by_provider("provider-slm")
    mlm_models = discovery.by_provider("provider-mlm")
    llm_models = discovery.by_provider("provider-llm")

    assert len(slm_models) == 2
    assert len(mlm_models) == 1
    assert len(llm_models) == 1

    print("TEST 5 - PROVIDER INDEXING: PASS")

    # 6. Model metadata survives discovery
    assert balanced.context_window == 131072
    assert balanced.max_output_tokens == 8192
    assert balanced.pricing.input_per_1m_tokens == 0.006
    assert balanced.pricing.output_per_1m_tokens == 0.008
    assert balanced.latency_ms == 180.0
    assert balanced.quality_score == 0.90

    assert balanced.capabilities.reasoning is True
    assert balanced.capabilities.code is True
    assert balanced.capabilities.vision is True
    assert balanced.capabilities.tool_use is True
    assert balanced.capabilities.agentic is True

    print("TEST 6 - MODEL METADATA PRESERVATION: PASS")

    # 7. Alias metadata survives discovery
    assert "balanced" in balanced.aliases
    assert "model-mid" in balanced.aliases
    assert "premium" in premium.aliases

    print("TEST 7 - ALIAS PRESERVATION: PASS")

    # 8. Duplicate discovery normalization
    duplicate_source = RealProviderSource(
        "provider-mlm",
        [
            balanced,
            balanced,
        ],
    )

    duplicate_scanner = ModelScanner(
        [duplicate_source]
    )

    duplicate_models = duplicate_scanner.scan()

    assert len(duplicate_models) == 1
    assert duplicate_models[0].qualified_id == (
        "provider-mlm:model-balanced"
    )

    print("TEST 8 - DISCOVERY DEDUPLICATION: PASS")

    # 9. Discovery index direct behavior
    index = ModelDiscoveryIndex(discovered)

    assert index.count() == 4
    assert index.get(
        "provider-llm:model-premium"
    ) == premium

    assert index.by_provider(
        "provider-mlm"
    ) == [balanced]

    assert index.providers() == {
        "provider-slm",
        "provider-mlm",
        "provider-llm",
    }

    print("TEST 9 - DISCOVERY INDEX: PASS")

    # 10. Missing model handling
    assert discovery.get(
        "provider-unknown:missing-model"
    ) is None

    assert discovery.by_provider(
        "provider-unknown"
    ) == []

    print("TEST 10 - MISSING MODEL HANDLING: PASS")

    # 11. Refresh re-scans providers
    refreshed = discovery.refresh()

    assert len(refreshed) == 4
    assert discovery.count() == 4

    assert slm_source.discovery_calls == 2
    assert mlm_source.discovery_calls == 2
    assert llm_source.discovery_calls == 2

    print("TEST 11 - DISCOVERY REFRESH: PASS")

    # 12. Refresh replaces the discovery index
    assert discovery.get(
        "provider-slm:qwen-0.5b"
    ) is not None

    assert discovery.get(
        "provider-mlm:model-balanced"
    ) is not None

    assert discovery.get(
        "provider-llm:model-premium"
    ) is not None

    print("TEST 12 - INDEX REFRESH CONSISTENCY: PASS")

    # 13. Scanner source removal
    removed = scanner.remove_source("provider-slm")

    assert removed is True
    assert len(scanner.sources()) == 2

    remaining = {
        source.provider
        for source in scanner.sources()
    }

    assert remaining == {
        "provider-mlm",
        "provider-llm",
    }

    print("TEST 13 - PROVIDER SOURCE REMOVAL: PASS")

    # 14. Discovery after provider removal
    after_removal = discovery.refresh()

    assert len(after_removal) == 2
    assert discovery.count() == 2

    assert discovery.get(
        "provider-slm:qwen-0.5b"
    ) is None

    assert discovery.get(
        "provider-mlm:model-balanced"
    ) is not None

    assert discovery.get(
        "provider-llm:model-premium"
    ) is not None

    print("TEST 14 - POST-REMOVAL DISCOVERY: PASS")

    # 15. Invalid source output protection
    class InvalidSource:
        @property
        def provider(self) -> str:
            return "provider-invalid"

        def discover_models(self):
            return [
                "not-a-model-record"
            ]

    invalid_scanner = ModelScanner(
        [InvalidSource()]
    )

    try:
        invalid_scanner.scan()
    except TypeError:
        invalid_output_rejected = True
    else:
        invalid_output_rejected = False

    assert invalid_output_rejected is True

    print("TEST 15 - INVALID SOURCE OUTPUT REJECTION: PASS")

    print()
    print("=" * 100)
    print("MODELNOW REAL MODEL DISCOVERY INTEGRATION TEST: PASS")
    print("=" * 100)


if __name__ == "__main__":
    main()
