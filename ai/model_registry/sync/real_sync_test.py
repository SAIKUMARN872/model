from __future__ import annotations

from datetime import datetime, timedelta, timezone

from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)
from ai.model_registry.registry.manager import ModelRegistryManager
from ai.model_registry.sync.providers import (
    ProviderCollection,
    SyncProvider,
)
from ai.model_registry.sync.scheduler import SyncSchedule
from ai.model_registry.sync.sync import (
    ModelSynchronizer,
    SyncResult,
)
from ai.model_registry.sync.utils import (
    changed_models,
    normalize_sync_models,
    provider_models,
)
from ai.model_registry.validator.validator import (
    ModelValidationException,
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


def build_models() -> tuple[
    ModelRecord,
    ModelRecord,
    ModelRecord,
]:
    slm = ModelRecord(
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
    )

    mlm = ModelRecord(
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
    )

    llm = ModelRecord(
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

    return slm, mlm, llm


def main() -> None:
    slm, mlm, llm = build_models()

    slm_source = RealProviderSource(
        "provider-slm",
        [slm],
    )

    mlm_source = RealProviderSource(
        "provider-mlm",
        [mlm],
    )

    llm_source = RealProviderSource(
        "provider-llm",
        [llm],
    )

    slm_provider = SyncProvider(slm_source)
    mlm_provider = SyncProvider(mlm_source)
    llm_provider = SyncProvider(llm_source)

    providers = ProviderCollection(
        [
            slm_provider,
            mlm_provider,
            llm_provider,
        ]
    )

    registry = ModelRegistryManager()

    synchronizer = ModelSynchronizer(
        registry=registry,
        providers=providers,
    )

    print("=" * 100)
    print("MODELNOW REAL MODEL SYNC INTEGRATION TEST")
    print("=" * 100)

    # 1. Provider collection
    assert providers.count() == 3
    assert providers.providers() == {
        "provider-slm",
        "provider-mlm",
        "provider-llm",
    }

    print("TEST 1 - PROVIDER COLLECTION: PASS")
    print(f"  Providers: {sorted(providers.providers())}")

    # 2. Sync provider discovery
    assert slm_provider.provider == "provider-slm"
    assert mlm_provider.provider == "provider-mlm"
    assert llm_provider.provider == "provider-llm"

    assert slm_provider.discover_models() == [slm]
    assert mlm_provider.discover_models() == [mlm]
    assert llm_provider.discover_models() == [llm]

    print("TEST 2 - SYNC PROVIDER DISCOVERY: PASS")

    # 3. Initial sync creates canonical registry records
    result = synchronizer.sync_all()

    assert isinstance(result, SyncResult)
    assert result.discovered == 3
    assert result.created == 3
    assert result.updated == 0
    assert result.unchanged == 0
    assert result.total_synced == 3
    assert registry.count() == 3

    print("TEST 3 - INITIAL SYNC / CREATION: PASS")
    print(
        f"  discovered={result.discovered} "
        f"created={result.created} "
        f"updated={result.updated} "
        f"unchanged={result.unchanged}"
    )

    # 4. Canonical registry lookup after sync
    assert registry.get(
        "provider-slm",
        "qwen-0.5b",
    ) == slm

    assert registry.get(
        "provider-mlm",
        "model-balanced",
    ) == mlm

    assert registry.get(
        "provider-llm",
        "model-premium",
    ) == llm

    print("TEST 4 - REGISTRY LOOKUP AFTER SYNC: PASS")

    # 5. Second sync detects unchanged models
    result = synchronizer.sync_all()

    assert result.discovered == 3
    assert result.created == 0
    assert result.updated == 0
    assert result.unchanged == 3
    assert result.total_synced == 3

    assert registry.count() == 3

    print("TEST 5 - UNCHANGED SYNC DETECTION: PASS")

    # 6. Provider-specific sync
    result = synchronizer.sync_provider(
        "PROVIDER-MLM"
    )

    assert result.discovered == 1
    assert result.created == 0
    assert result.updated == 0
    assert result.unchanged == 1

    assert mlm_source.discovery_calls >= 2

    print("TEST 6 - PROVIDER-SPECIFIC SYNC: PASS")

    # 7. Changed model is updated
    updated_mlm = ModelRecord(
        provider="provider-mlm",
        model_id="model-balanced",
        display_name="Balanced Model Updated",
        tier=ModelTier.MLM,
        context_window=131072,
        max_output_tokens=16384,
        pricing=ModelPricing(
            input_per_1m_tokens=0.005,
            output_per_1m_tokens=0.007,
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
        latency_ms=160.0,
        quality_score=0.93,
        aliases=("balanced", "model-mid", "updated"),
        enabled=True,
        available=True,
        version="2.1",
    )

    mlm_source._models = [updated_mlm]

    result = synchronizer.sync_provider(
        "provider-mlm"
    )

    assert result.discovered == 1
    assert result.created == 0
    assert result.updated == 1
    assert result.unchanged == 0

    stored_mlm = registry.get(
        "provider-mlm",
        "model-balanced",
    )

    assert stored_mlm == updated_mlm
    assert stored_mlm is not None
    assert stored_mlm.display_name == (
        "Balanced Model Updated"
    )
    assert stored_mlm.max_output_tokens == 16384
    assert stored_mlm.quality_score == 0.93
    assert stored_mlm.version == "2.1"

    print("TEST 7 - CHANGED MODEL UPDATE: PASS")

    # 8. SyncResult accounting
    assert result.total_synced == (
        result.created
        + result.updated
        + result.unchanged
    )

    print("TEST 8 - SYNC RESULT ACCOUNTING: PASS")

    # 9. Duplicate provider models are normalized
    duplicate_models = normalize_sync_models(
        [
            slm,
            slm,
            updated_mlm,
            updated_mlm,
        ]
    )

    assert duplicate_models == [
        slm,
        updated_mlm,
    ]

    print("TEST 9 - SYNC DEDUPLICATION: PASS")

    # 10. Changed-model utility
    existing = [
        slm,
        mlm,
        llm,
    ]

    incoming = [
        slm,
        updated_mlm,
        llm,
    ]

    changed = changed_models(
        existing,
        incoming,
    )

    assert changed == [
        updated_mlm,
    ]

    print("TEST 10 - CHANGED MODEL DETECTION UTILITY: PASS")

    # 11. Provider filtering utility
    provider_filtered = provider_models(
        [
            slm,
            updated_mlm,
            llm,
        ],
        "PROVIDER-MLM",
    )

    assert provider_filtered == [
        updated_mlm,
    ]

    assert provider_models(
        [
            slm,
            updated_mlm,
            llm,
        ],
        "provider-missing",
    ) == []

    print("TEST 11 - PROVIDER MODEL FILTERING UTILITY: PASS")

    # 12. Unknown provider rejection
    try:
        synchronizer.sync_provider(
            "provider-unknown"
        )
    except ValueError:
        unknown_provider_rejected = True
    else:
        unknown_provider_rejected = False

    assert unknown_provider_rejected is True

    print("TEST 12 - UNKNOWN PROVIDER PROTECTION: PASS")

    # 13. Invalid provider model output
    class InvalidProviderSource:
        @property
        def provider(self) -> str:
            return "provider-invalid"

        def discover_models(self):
            return [
                "not-a-model-record"
            ]

    invalid_provider = SyncProvider(
        InvalidProviderSource()
    )

    invalid_collection = ProviderCollection(
        [invalid_provider]
    )

    invalid_synchronizer = ModelSynchronizer(
        registry=ModelRegistryManager(),
        providers=invalid_collection,
    )

    try:
        invalid_synchronizer.sync_all()
    except TypeError:
        invalid_output_rejected = True
    else:
        invalid_output_rejected = False

    assert invalid_output_rejected is True

    print("TEST 13 - INVALID PROVIDER OUTPUT REJECTION: PASS")

    # 14. Invalid model validation
    invalid_model = ModelRecord(
        provider="provider-invalid",
        model_id="invalid-model",
        display_name="Invalid Model",
        tier=ModelTier.MLM,
        context_window=0,
        max_output_tokens=0,
    )

    invalid_model_source = RealProviderSource(
        "provider-invalid",
        [invalid_model],
    )

    invalid_model_provider = SyncProvider(
        invalid_model_source
    )

    invalid_model_synchronizer = ModelSynchronizer(
        registry=ModelRegistryManager(),
        providers=ProviderCollection(
            [invalid_model_provider]
        ),
    )

    try:
        invalid_model_synchronizer.sync_all()
    except ModelValidationException as exc:
        validation_failed = True
        assert len(exc.errors) >= 2
    else:
        validation_failed = False

    assert validation_failed is True

    print("TEST 14 - MODEL VALIDATION DURING SYNC: PASS")

    # 15. Provider collection removal
    removed = providers.remove(
        "PROVIDER-SLM"
    )

    assert removed is True
    assert providers.count() == 2
    assert providers.providers() == {
        "provider-mlm",
        "provider-llm",
    }

    print("TEST 15 - PROVIDER REMOVAL: PASS")

    # 16. Missing provider removal
    assert providers.remove(
        "provider-missing"
    ) is False

    assert providers.count() == 2

    print("TEST 16 - MISSING PROVIDER REMOVAL: PASS")

    # 17. Sync after provider removal
    result = synchronizer.sync_all()

    assert result.discovered == 2
    assert result.created == 0
    assert result.updated == 0
    assert result.unchanged == 2

    print("TEST 17 - POST-REMOVAL SYNC: PASS")

    # 18. Sync schedule initial state
    schedule = SyncSchedule(
        interval_seconds=3600
    )

    initial_time = datetime(
        2026,
        10,
        8,
        10,
        0,
        tzinfo=timezone.utc,
    )

    assert schedule.is_due(initial_time) is True
    assert schedule.next_run(
        initial_time
    ) == initial_time

    print("TEST 18 - INITIAL SYNC SCHEDULE: PASS")

    # 19. Schedule after completed run
    schedule.mark_run(initial_time)

    expected_next = initial_time + timedelta(
        seconds=3600
    )

    assert schedule.next_run(
        initial_time
    ) == expected_next

    assert schedule.is_due(
        initial_time + timedelta(
            seconds=3599
        )
    ) is False

    assert schedule.is_due(
        initial_time + timedelta(
            seconds=3600
        )
    ) is True

    print("TEST 19 - SYNC SCHEDULE DUE CHECK: PASS")

    # 20. Schedule reset
    schedule.reset()

    assert schedule.last_run is None
    assert schedule.is_due(initial_time) is True

    print("TEST 20 - SYNC SCHEDULE RESET: PASS")

    # 21. Invalid schedule interval protection
    try:
        SyncSchedule(interval_seconds=0)
    except ValueError:
        invalid_interval_rejected = True
    else:
        invalid_interval_rejected = False

    assert invalid_interval_rejected is True

    print("TEST 21 - INVALID SCHEDULE PROTECTION: PASS")

    # 22. Sync provider duplicate-object protection
    duplicate_collection = ProviderCollection()

    duplicate_collection.add(slm_provider)
    duplicate_collection.add(slm_provider)

    assert duplicate_collection.count() == 1

    print("TEST 22 - DUPLICATE PROVIDER PROTECTION: PASS")

    print()
    print("=" * 100)
    print("MODELNOW REAL MODEL SYNC INTEGRATION TEST: PASS")
    print("=" * 100)


if __name__ == "__main__":
    main()
