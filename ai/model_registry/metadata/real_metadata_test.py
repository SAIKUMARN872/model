from __future__ import annotations

from ai.model_registry.metadata.attributes import ModelAttributes
from ai.model_registry.metadata.metadata import (
    MetadataStore,
    ModelMetadata,
)
from ai.model_registry.metadata.tags import (
    merge_tags,
    normalize_tags,
)
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
    ]


def main() -> None:
    models = build_models()

    print("=" * 100)
    print("MODELNOW REAL MODEL METADATA INTEGRATION TEST")
    print("=" * 100)

    # 1. Model attributes
    attributes = ModelAttributes(
        organization="ModelNow Labs",
        family="ModelNow Foundation",
        release_date="2026-01-15",
        deprecation_date=None,
        parameter_count=700_000_000,
        open_weights=True,
        commercial_use=True,
        input_modalities=("text", "image"),
        output_modalities=("text",),
        metadata={
            "architecture": "transformer",
            "quantization": "int8",
        },
    )

    assert attributes.organization == "ModelNow Labs"
    assert attributes.family == "ModelNow Foundation"
    assert attributes.release_date == "2026-01-15"
    assert attributes.parameter_count == 700_000_000
    assert attributes.open_weights is True
    assert attributes.commercial_use is True
    assert attributes.input_modalities == ("text", "image")
    assert attributes.output_modalities == ("text",)
    assert attributes.metadata["architecture"] == "transformer"

    print("TEST 1 - MODEL ATTRIBUTES: PASS")

    # 2. Metadata creation from canonical ModelRecord
    balanced = models[1]

    metadata = ModelMetadata.from_model(
        balanced,
        attributes=attributes,
        tags=(
            "Enterprise",
            "Reasoning",
            "enterprise",
            " RAG ",
        ),
        description="Balanced enterprise model",
        documentation_url="https://example.com/docs/model-balanced",
        license="Apache-2.0",
        metadata={
            "source": "provider-catalog",
            "region": "global",
        },
    )

    assert metadata.qualified_id == (
        "provider-mlm:model-balanced"
    )

    assert metadata.attributes == attributes
    assert metadata.description == "Balanced enterprise model"
    assert metadata.documentation_url == (
        "https://example.com/docs/model-balanced"
    )
    assert metadata.license == "Apache-2.0"

    print("TEST 2 - METADATA FROM MODEL: PASS")

    # 3. Tag normalization
    assert metadata.tags == (
        "enterprise",
        "reasoning",
        "rag",
    )

    assert metadata.has_tag("ENTERPRISE") is True
    assert metadata.has_tag(" reasoning ") is True
    assert metadata.has_tag("missing") is False

    print("TEST 3 - TAG NORMALIZATION + LOOKUP: PASS")

    # 4. Custom metadata preservation
    assert metadata.metadata == {
        "source": "provider-catalog",
        "region": "global",
    }

    print("TEST 4 - CUSTOM METADATA: PASS")

    # 5. Metadata immutability through with_tags
    updated = metadata.with_tags(
        (
            "Production",
            "RAG",
            "production",
            " enterprise ",
        )
    )

    assert updated is not metadata
    assert updated.qualified_id == metadata.qualified_id
    assert updated.attributes == metadata.attributes
    assert updated.description == metadata.description
    assert updated.documentation_url == metadata.documentation_url
    assert updated.license == metadata.license
    assert updated.metadata == metadata.metadata

    assert updated.tags == (
        "production",
        "rag",
        "enterprise",
    )

    assert metadata.tags == (
        "enterprise",
        "reasoning",
        "rag",
    )

    print("TEST 5 - IMMUTABLE TAG UPDATE: PASS")

    # 6. Tag normalization utility
    normalized = normalize_tags(
        (
            " Enterprise ",
            "RAG",
            "enterprise",
            "",
            "  ",
            "Reasoning",
        )
    )

    assert normalized == (
        "enterprise",
        "rag",
        "reasoning",
    )

    print("TEST 6 - NORMALIZE TAGS UTILITY: PASS")

    # 7. Invalid tag type protection
    try:
        normalize_tags(
            (
                "valid",
                123,
            )
        )
    except TypeError:
        invalid_tag_rejected = True
    else:
        invalid_tag_rejected = False

    assert invalid_tag_rejected is True

    print("TEST 7 - INVALID TAG PROTECTION: PASS")

    # 8. Merge tags
    merged = merge_tags(
        ("enterprise", "rag"),
        ("RAG", "reasoning"),
        ("production", "enterprise"),
    )

    assert merged == (
        "enterprise",
        "rag",
        "reasoning",
        "production",
    )

    print("TEST 8 - TAG MERGE: PASS")

    # 9. Metadata store registration
    store = MetadataStore()

    registered = store.register(metadata)

    assert registered == metadata
    assert store.count() == 1
    assert store.get(metadata.qualified_id) == metadata

    print("TEST 9 - METADATA STORE REGISTRATION: PASS")

    # 10. Case-insensitive qualified ID lookup
    assert store.get(
        "PROVIDER-MLM:MODEL-BALANCED"
    ) == metadata

    print("TEST 10 - CASE-INSENSITIVE LOOKUP: PASS")

    # 11. Duplicate registration protection
    try:
        store.register(metadata)
    except ValueError:
        duplicate_rejected = True
    else:
        duplicate_rejected = False

    assert duplicate_rejected is True

    print("TEST 11 - DUPLICATE REGISTRATION PROTECTION: PASS")

    # 12. Upsert existing metadata
    replacement = ModelMetadata.from_model(
        balanced,
        attributes=attributes,
        tags=("updated", "enterprise"),
        description="Updated balanced model metadata",
        license="Apache-2.0",
        metadata={
            "source": "updated-catalog",
        },
    )

    result = store.upsert(replacement)

    assert result == replacement
    assert store.count() == 1
    assert store.get(
        balanced.qualified_id
    ) == replacement

    print("TEST 12 - EXISTING METADATA UPSERT: PASS")

    # 13. Upsert metadata for additional models
    slm_metadata = ModelMetadata.from_model(
        models[0],
        tags=("slm", "fast", "cost-optimized"),
        description="Small fast model",
    )

    llm_metadata = ModelMetadata.from_model(
        models[2],
        tags=("llm", "premium", "reasoning"),
        description="Premium reasoning model",
    )

    store.upsert(slm_metadata)
    store.upsert(llm_metadata)

    assert store.count() == 3

    print("TEST 13 - MULTI-MODEL METADATA STORE: PASS")
    print(f"  Metadata records: {store.count()}")

    # 14. List all metadata
    items = store.list_all()

    assert len(items) == 3
    assert {
        item.qualified_id
        for item in items
    } == {
        models[0].qualified_id,
        models[1].qualified_id,
        models[2].qualified_id,
    }

    print("TEST 14 - METADATA LISTING: PASS")

    # 15. Remove metadata
    removed = store.remove(
        models[0].qualified_id
    )

    assert removed == slm_metadata
    assert store.count() == 2
    assert store.get(
        models[0].qualified_id
    ) is None

    print("TEST 15 - METADATA REMOVAL: PASS")

    # 16. Missing metadata handling
    assert store.get(
        "provider-missing:model-missing"
    ) is None

    removed_missing = store.remove(
        "provider-missing:model-missing"
    )

    assert removed_missing is None

    print("TEST 16 - MISSING METADATA HANDLING: PASS")

    # 17. Invalid metadata protection
    try:
        store.register("not-model-metadata")
    except TypeError:
        invalid_metadata_rejected = True
    else:
        invalid_metadata_rejected = False

    assert invalid_metadata_rejected is True

    try:
        store.upsert("not-model-metadata")
    except TypeError:
        invalid_upsert_rejected = True
    else:
        invalid_upsert_rejected = False

    assert invalid_upsert_rejected is True

    print("TEST 17 - INVALID METADATA PROTECTION: PASS")

    # 18. Model validation in from_model
    try:
        ModelMetadata.from_model(
            "not-a-model-record"
        )
    except TypeError:
        invalid_model_rejected = True
    else:
        invalid_model_rejected = False

    assert invalid_model_rejected is True

    print("TEST 18 - INVALID MODEL INPUT PROTECTION: PASS")

    # 19. Multiple metadata fields across model tiers
    premium = store.get(
        "provider-llm:model-premium"
    )

    assert premium is not None
    assert premium.tags == (
        "llm",
        "premium",
        "reasoning",
    )

    assert premium.qualified_id == (
        "provider-llm:model-premium"
    )

    print("TEST 19 - TIER METADATA COVERAGE: PASS")

    # 20. Store clear
    store.clear()

    assert store.count() == 0
    assert store.list_all() == []
    assert store.get(
        "provider-llm:model-premium"
    ) is None

    print("TEST 20 - METADATA STORE CLEAR: PASS")

    print()
    print("=" * 100)
    print("MODELNOW REAL MODEL METADATA INTEGRATION TEST: PASS")
    print("=" * 100)


if __name__ == "__main__":
    main()
