from __future__ import annotations

from ai.model_registry.catalog.catalog import ModelCatalog
from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)
from ai.model_registry.registry.manager import ModelRegistryManager
from ai.model_registry.schemas import ModelQuery


def build_registry() -> ModelRegistryManager:
    registry = ModelRegistryManager()

    registry.register(
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
                reasoning=False,
                code=True,
                vision=False,
                audio=False,
                tool_use=False,
                structured_output=False,
                streaming=True,
                long_context=False,
                agentic=False,
            ),
            latency_ms=100.0,
            quality_score=0.82,
            aliases=("qwen-small", "qwen-0.5b-instruct"),
            enabled=True,
            available=True,
            version="1.0",
        )
    )

    registry.register(
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
                audio=False,
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
        )
    )

    registry.register(
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
        )
    )

    registry.register(
        ModelRecord(
            provider="provider-disabled",
            model_id="disabled-model",
            display_name="Disabled Model",
            tier=ModelTier.MLM,
            context_window=32768,
            pricing=ModelPricing(
                input_per_1m_tokens=0.004,
                output_per_1m_tokens=0.005,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                streaming=True,
            ),
            latency_ms=250.0,
            quality_score=0.70,
            enabled=False,
            available=False,
        )
    )

    return registry


def main() -> None:
    registry = build_registry()
    catalog = ModelCatalog(registry)

    print("=" * 100)
    print("MODELNOW REAL MODEL CATALOG INTEGRATION TEST")
    print("=" * 100)

    # 1. Catalog listing
    models = catalog.all()
    assert len(models) == 4
    print("TEST 1 - CATALOG LISTING: PASS")
    print(f"  Catalog models: {len(models)}")

    # 2. Search
    results = catalog.search("balanced")
    assert len(results) == 1
    assert results[0].model_id == "model-balanced"

    results = catalog.search("provider-llm")
    assert len(results) == 1
    assert results[0].model_id == "model-premium"

    print("TEST 2 - SEARCH: PASS")

    # 3. Exact match + alias
    exact = catalog.find_exact("model-premium")
    assert exact is not None
    assert exact.model_id == "model-premium"

    alias = catalog.find_exact("premium")
    assert alias is not None
    assert alias.model_id == "model-premium"

    print("TEST 3 - EXACT + ALIAS MATCH: PASS")

    # 4. Provider filtering
    provider_models = catalog.by_provider("provider-mlm")
    assert len(provider_models) == 1
    assert provider_models[0].model_id == "model-balanced"

    print("TEST 4 - PROVIDER FILTERING: PASS")

    # 5. Tier filtering
    slm_models = catalog.filter(
        ModelQuery(tier=ModelTier.SLM)
    )
    mlm_models = catalog.filter(
        ModelQuery(tier=ModelTier.MLM)
    )
    llm_models = catalog.filter(
        ModelQuery(tier=ModelTier.LLM)
    )

    assert len(slm_models) == 1
    assert len(mlm_models) == 2
    assert len(llm_models) == 1

    print("TEST 5 - TIER FILTERING: PASS")
    print(
        f"  SLM={slm_models[0].model_id} "
        f"MLM={[m.model_id for m in mlm_models]} "
        f"LLM={llm_models[0].model_id}"
    )

    # 6. Capability filtering
    reasoning_models = catalog.filter(
        ModelQuery(requires_reasoning=True)
    )
    vision_models = catalog.filter(
        ModelQuery(requires_vision=True)
    )
    agentic_models = catalog.filter(
        ModelQuery(requires_agentic=True)
    )

    assert {m.model_id for m in reasoning_models} == {
        "model-balanced",
        "model-premium",
    }

    assert {m.model_id for m in vision_models} == {
        "model-balanced",
        "model-premium",
    }

    assert {m.model_id for m in agentic_models} == {
        "model-balanced",
        "model-premium",
    }

    print("TEST 6 - CAPABILITY FILTERING: PASS")

    # 7. Cost filtering
    low_cost_models = catalog.filter(
        ModelQuery(
            max_input_cost_per_1m=0.006,
            max_output_cost_per_1m=0.008,
        )
    )

    assert {m.model_id for m in low_cost_models} == {
        "qwen-0.5b",
        "model-balanced",
        "disabled-model",
    }

    print("TEST 7 - COST FILTERING: PASS")

    # 8. Latency filtering
    fast_models = catalog.filter(
        ModelQuery(max_latency_ms=180.0)
    )

    assert {m.model_id for m in fast_models} == {
        "qwen-0.5b",
        "model-balanced",
    }

    print("TEST 8 - LATENCY FILTERING: PASS")

    # 9. Quality filtering
    high_quality_models = catalog.filter(
        ModelQuery(min_quality_score=0.90)
    )

    assert {m.model_id for m in high_quality_models} == {
        "model-balanced",
        "model-premium",
    }

    print("TEST 9 - QUALITY FILTERING: PASS")

    # 10. Context-window filtering
    long_context_models = catalog.filter(
        ModelQuery(min_context_window=100000)
    )

    assert {m.model_id for m in long_context_models} == {
        "model-balanced",
        "model-premium",
    }

    print("TEST 10 - CONTEXT WINDOW FILTERING: PASS")

    # 11. Enabled / available filtering
    active_models = catalog.filter(
        ModelQuery(
            enabled_only=True,
            available_only=True,
        )
    )

    assert {m.model_id for m in active_models} == {
        "qwen-0.5b",
        "model-balanced",
        "model-premium",
    }

    print("TEST 11 - ENABLED / AVAILABLE FILTERING: PASS")

    # 12. Combined enterprise query
    enterprise_query = ModelQuery(
        tier=ModelTier.MLM,
        requires_chat=True,
        requires_reasoning=True,
        requires_code=True,
        requires_tool_use=True,
        requires_structured_output=True,
        requires_long_context=True,
        requires_agentic=True,
        min_context_window=100000,
        max_input_cost_per_1m=0.010,
        max_output_cost_per_1m=0.010,
        max_latency_ms=200.0,
        min_quality_score=0.85,
        enabled_only=True,
        available_only=True,
    )

    enterprise_models = catalog.filter(enterprise_query)

    assert len(enterprise_models) == 1
    assert enterprise_models[0].model_id == "model-balanced"

    print("TEST 12 - COMBINED ENTERPRISE FILTER: PASS")
    print(
        f"  Selected={enterprise_models[0].model_id} "
        f"provider={enterprise_models[0].provider}"
    )

    # 13. Sorting by quality
    quality_sorted = catalog.by_quality()
    assert [m.model_id for m in quality_sorted] == [
        "model-premium",
        "model-balanced",
        "qwen-0.5b",
        "disabled-model",
    ]

    print("TEST 13 - QUALITY SORTING: PASS")

    # 14. Sorting by latency
    latency_sorted = catalog.by_latency()
    assert [m.model_id for m in latency_sorted] == [
        "qwen-0.5b",
        "model-balanced",
        "disabled-model",
        "model-premium",
    ]

    print("TEST 14 - LATENCY SORTING: PASS")

    # 15. Sorting by input cost
    input_cost_sorted = catalog.by_input_cost()
    assert [m.model_id for m in input_cost_sorted] == [
        "qwen-0.5b",
        "disabled-model",
        "model-balanced",
        "model-premium",
    ]

    print("TEST 15 - INPUT COST SORTING: PASS")

    # 16. Sorting by output cost
    output_cost_sorted = catalog.by_output_cost()
    assert [m.model_id for m in output_cost_sorted] == [
        "qwen-0.5b",
        "disabled-model",
        "model-balanced",
        "model-premium",
    ]

    print("TEST 16 - OUTPUT COST SORTING: PASS")

    # 17. Deduplication
    duplicate_input = [
        models[0],
        models[0],
        models[1],
        models[1],
        models[2],
    ]

    deduplicated = catalog.deduplicate(duplicate_input)

    assert len(deduplicated) == 3
    assert len({
        model.qualified_id.lower()
        for model in deduplicated
    }) == 3

    print("TEST 17 - DEDUPLICATION: PASS")

    print()
    print("=" * 100)
    print("MODELNOW REAL MODEL CATALOG INTEGRATION TEST: PASS")
    print("=" * 100)


if __name__ == "__main__":
    main()
