from __future__ import annotations

import unittest
from datetime import datetime, timedelta, timezone

from ..models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)
from ..registry.manager import ModelRegistryManager
from ..validator.validator import ModelValidator
from .providers import ProviderCollection, SyncProvider
from .scheduler import SyncSchedule
from .sync import ModelSynchronizer
from .utils import (
    changed_models,
    normalize_sync_models,
    provider_models,
)


class FakeProvider:
    def __init__(
        self,
        provider: str,
        models: list[ModelRecord],
    ) -> None:
        self._provider = provider
        self._models = models

    @property
    def provider(self) -> str:
        return self._provider

    def discover_models(self) -> list[ModelRecord]:
        return list(self._models)


def make_model(
    provider: str = "openai",
    model_id: str = "test-model",
    quality: float = 0.90,
) -> ModelRecord:
    return ModelRecord(
        provider=provider,
        model_id=model_id,
        display_name=model_id.replace("-", " ").title(),
        tier=ModelTier.LLM,
        context_window=128000,
        max_output_tokens=4096,
        pricing=ModelPricing(
            input_per_1m_tokens=2.0,
            output_per_1m_tokens=8.0,
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
        quality_score=quality,
        aliases=("alias-model",),
    )


class TestSyncProviders(unittest.TestCase):

    def test_sync_provider_exposes_provider(self):
        source = FakeProvider(
            "openai",
            [make_model()],
        )

        provider = SyncProvider(source)

        self.assertEqual(
            provider.provider,
            "openai",
        )

    def test_sync_provider_discovers_models(self):
        model = make_model()

        provider = SyncProvider(
            FakeProvider("openai", [model])
        )

        self.assertEqual(
            provider.discover_models(),
            [model],
        )

    def test_provider_collection_add(self):
        collection = ProviderCollection()

        provider = SyncProvider(
            FakeProvider("openai", [])
        )

        collection.add(provider)

        self.assertEqual(
            collection.count(),
            1,
        )

    def test_provider_collection_deduplicates(self):
        collection = ProviderCollection()

        provider = SyncProvider(
            FakeProvider("openai", [])
        )

        collection.add(provider)
        collection.add(provider)

        self.assertEqual(
            collection.count(),
            1,
        )

    def test_provider_collection_lists_providers(self):
        collection = ProviderCollection()

        collection.add(
            SyncProvider(
                FakeProvider("openai", [])
            )
        )

        collection.add(
            SyncProvider(
                FakeProvider("anthropic", [])
            )
        )

        self.assertEqual(
            collection.providers(),
            {"openai", "anthropic"},
        )

    def test_provider_collection_remove(self):
        collection = ProviderCollection()

        collection.add(
            SyncProvider(
                FakeProvider("openai", [])
            )
        )

        removed = collection.remove("openai")

        self.assertTrue(removed)
        self.assertEqual(
            collection.count(),
            0,
        )

    def test_provider_collection_remove_missing(self):
        collection = ProviderCollection()

        self.assertFalse(
            collection.remove("missing")
        )


class TestSyncUtils(unittest.TestCase):

    def test_normalize_models(self):
        first = make_model(
            model_id="model-a"
        )
        second = make_model(
            model_id="model-b"
        )

        result = normalize_sync_models(
            [first, second]
        )

        self.assertEqual(
            result,
            [first, second],
        )

    def test_normalize_removes_duplicates(self):
        model = make_model()

        result = normalize_sync_models(
            [model, model]
        )

        self.assertEqual(
            result,
            [model],
        )

    def test_normalize_rejects_invalid_model(self):
        with self.assertRaises(TypeError):
            normalize_sync_models(
                ["invalid"]  # type: ignore[list-item]
            )

    def test_provider_models_filters_provider(self):
        openai_model = make_model(
            provider="openai"
        )
        anthropic_model = make_model(
            provider="anthropic",
            model_id="claude-test",
        )

        result = provider_models(
            [
                openai_model,
                anthropic_model,
            ],
            "openai",
        )

        self.assertEqual(
            result,
            [openai_model],
        )

    def test_changed_models_detects_new_model(self):
        model = make_model()

        result = changed_models(
            [],
            [model],
        )

        self.assertEqual(
            result,
            [model],
        )

    def test_changed_models_ignores_identical_model(self):
        model = make_model()

        result = changed_models(
            [model],
            [model],
        )

        self.assertEqual(
            result,
            [],
        )

    def test_changed_models_detects_updated_model(self):
        old_model = make_model(
            quality=0.80
        )
        new_model = make_model(
            quality=0.95
        )

        result = changed_models(
            [old_model],
            [new_model],
        )

        self.assertEqual(
            result,
            [new_model],
        )


class TestModelSynchronizer(unittest.TestCase):

    def create_synchronizer(
        self,
        providers: list[SyncProvider],
    ) -> tuple[
        ModelRegistryManager,
        ModelSynchronizer,
    ]:
        registry = ModelRegistryManager()

        collection = ProviderCollection(
            providers
        )

        synchronizer = ModelSynchronizer(
            registry=registry,
            providers=collection,
            validator=ModelValidator(),
        )

        return registry, synchronizer

    def test_sync_creates_models(self):
        model = make_model()

        registry, synchronizer = (
            self.create_synchronizer(
                [
                    SyncProvider(
                        FakeProvider(
                            "openai",
                            [model],
                        )
                    )
                ]
            )
        )

        result = synchronizer.sync_all()

        self.assertEqual(
            result.discovered,
            1,
        )
        self.assertEqual(
            result.created,
            1,
        )
        self.assertEqual(
            result.updated,
            0,
        )
        self.assertEqual(
            result.unchanged,
            0,
        )
        self.assertEqual(
            registry.count(),
            1,
        )

    def test_sync_detects_unchanged_model(self):
        model = make_model()

        registry, synchronizer = (
            self.create_synchronizer(
                [
                    SyncProvider(
                        FakeProvider(
                            "openai",
                            [model],
                        )
                    )
                ]
            )
        )

        synchronizer.sync_all()

        result = synchronizer.sync_all()

        self.assertEqual(
            result.created,
            0,
        )
        self.assertEqual(
            result.updated,
            0,
        )
        self.assertEqual(
            result.unchanged,
            1,
        )

    def test_sync_updates_existing_model(self):
        old_model = make_model(
            quality=0.80
        )

        new_model = make_model(
            quality=0.95
        )

        registry = ModelRegistryManager(
            [old_model]
        )

        synchronizer = ModelSynchronizer(
            registry=registry,
            providers=ProviderCollection(
                [
                    SyncProvider(
                        FakeProvider(
                            "openai",
                            [new_model],
                        )
                    )
                ]
            ),
        )

        result = synchronizer.sync_all()

        self.assertEqual(
            result.created,
            0,
        )
        self.assertEqual(
            result.updated,
            1,
        )

        stored = registry.get(
            "openai",
            "test-model",
        )

        self.assertEqual(
            stored,
            new_model,
        )

    def test_sync_multiple_providers(self):
        openai_model = make_model(
            provider="openai"
        )

        anthropic_model = make_model(
            provider="anthropic",
            model_id="claude-test",
        )

        registry, synchronizer = (
            self.create_synchronizer(
                [
                    SyncProvider(
                        FakeProvider(
                            "openai",
                            [openai_model],
                        )
                    ),
                    SyncProvider(
                        FakeProvider(
                            "anthropic",
                            [anthropic_model],
                        )
                    ),
                ]
            )
        )

        result = synchronizer.sync_all()

        self.assertEqual(
            result.discovered,
            2,
        )
        self.assertEqual(
            result.created,
            2,
        )
        self.assertEqual(
            registry.count(),
            2,
        )

    def test_sync_provider_only(self):
        openai_model = make_model(
            provider="openai"
        )

        anthropic_model = make_model(
            provider="anthropic",
            model_id="claude-test",
        )

        registry, synchronizer = (
            self.create_synchronizer(
                [
                    SyncProvider(
                        FakeProvider(
                            "openai",
                            [openai_model],
                        )
                    ),
                    SyncProvider(
                        FakeProvider(
                            "anthropic",
                            [anthropic_model],
                        )
                    ),
                ]
            )
        )

        result = synchronizer.sync_provider(
            "openai"
        )

        self.assertEqual(
            result.discovered,
            1,
        )
        self.assertEqual(
            result.created,
            1,
        )

        self.assertIsNotNone(
            registry.get(
                "openai",
                "test-model",
            )
        )

        self.assertIsNone(
            registry.get(
                "anthropic",
                "claude-test",
            )
        )

    def test_sync_unknown_provider(self):
        registry, synchronizer = (
            self.create_synchronizer([])
        )

        with self.assertRaises(ValueError):
            synchronizer.sync_provider(
                "missing"
            )

    def test_sync_rejects_invalid_model(self):
        invalid_model = ModelRecord(
            provider="openai",
            model_id="invalid",
            display_name="",
        )

        registry, synchronizer = (
            self.create_synchronizer(
                [
                    SyncProvider(
                        FakeProvider(
                            "openai",
                            [invalid_model],
                        )
                    )
                ]
            )
        )

        with self.assertRaises(Exception):
            synchronizer.sync_all()

        self.assertEqual(
            registry.count(),
            0,
        )

    def test_sync_result_total_synced(self):
        model_a = make_model(
            model_id="model-a"
        )
        model_b = make_model(
            model_id="model-b"
        )

        registry, synchronizer = (
            self.create_synchronizer(
                [
                    SyncProvider(
                        FakeProvider(
                            "openai",
                            [model_a, model_b],
                        )
                    )
                ]
            )
        )

        result = synchronizer.sync_all()

        self.assertEqual(
            result.total_synced,
            2,
        )


class TestSyncSchedule(unittest.TestCase):

    def test_schedule_initially_due(self):
        schedule = SyncSchedule(
            interval_seconds=3600
        )

        now = datetime(
            2026,
            1,
            1,
            tzinfo=timezone.utc,
        )

        self.assertTrue(
            schedule.is_due(now)
        )

    def test_schedule_mark_run(self):
        schedule = SyncSchedule(
            interval_seconds=3600
        )

        now = datetime(
            2026,
            1,
            1,
            tzinfo=timezone.utc,
        )

        schedule.mark_run(now)

        self.assertEqual(
            schedule.last_run,
            now,
        )

    def test_schedule_next_run(self):
        schedule = SyncSchedule(
            interval_seconds=3600
        )

        now = datetime(
            2026,
            1,
            1,
            tzinfo=timezone.utc,
        )

        schedule.mark_run(now)

        self.assertEqual(
            schedule.next_run(),
            now + timedelta(
                seconds=3600
            ),
        )

    def test_schedule_not_due_before_interval(self):
        schedule = SyncSchedule(
            interval_seconds=3600
        )

        start = datetime(
            2026,
            1,
            1,
            tzinfo=timezone.utc,
        )

        before_due = start + timedelta(
            minutes=30
        )

        schedule.mark_run(start)

        self.assertFalse(
            schedule.is_due(before_due)
        )

    def test_schedule_due_after_interval(self):
        schedule = SyncSchedule(
            interval_seconds=3600
        )

        start = datetime(
            2026,
            1,
            1,
            tzinfo=timezone.utc,
        )

        due = start + timedelta(
            hours=1
        )

        schedule.mark_run(start)

        self.assertTrue(
            schedule.is_due(due)
        )

    def test_schedule_reset(self):
        schedule = SyncSchedule(
            interval_seconds=3600
        )

        schedule.mark_run(
            datetime(
                2026,
                1,
                1,
                tzinfo=timezone.utc,
            )
        )

        schedule.reset()

        self.assertIsNone(
            schedule.last_run
        )

        self.assertTrue(
            schedule.is_due(
                datetime(
                    2026,
                    1,
                    1,
                    tzinfo=timezone.utc,
                )
            )
        )

    def test_schedule_rejects_zero_interval(self):
        with self.assertRaises(ValueError):
            SyncSchedule(
                interval_seconds=0
            )

    def test_schedule_rejects_negative_interval(self):
        with self.assertRaises(ValueError):
            SyncSchedule(
                interval_seconds=-1
            )


if __name__ == "__main__":
    unittest.main()
