from __future__ import annotations

import unittest

from model_registry.discovery.discovery import ModelDiscovery
from model_registry.discovery.indexer import ModelDiscoveryIndex
from model_registry.discovery.scanner import ModelScanner
from model_registry.models import ModelRecord, ModelTier


class FakeSource:
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

    def discover_models(self):
        return list(self._models)


def make_model(
    provider: str,
    model_id: str,
) -> ModelRecord:
    return ModelRecord(
        provider=provider,
        model_id=model_id,
        display_name=model_id.title(),
        tier=ModelTier.MLM,
        context_window=128000,
        max_output_tokens=16384,
        aliases=(model_id.replace("-", "_"),),
    )


class TestModelDiscovery(unittest.TestCase):

    def setUp(self):
        self.openai_models = [
            make_model("openai", "model-a"),
            make_model("openai", "model-b"),
        ]

        self.anthropic_models = [
            make_model("anthropic", "model-c"),
        ]

        self.openai = FakeSource(
            "openai",
            self.openai_models,
        )

        self.anthropic = FakeSource(
            "anthropic",
            self.anthropic_models,
        )

    def test_scanner_single_source(self):
        scanner = ModelScanner(
            [self.openai]
        )

        models = scanner.scan()

        self.assertEqual(
            models,
            self.openai_models,
        )

    def test_scanner_multiple_sources(self):
        scanner = ModelScanner(
            [
                self.openai,
                self.anthropic,
            ]
        )

        models = scanner.scan()

        self.assertEqual(len(models), 3)

        self.assertEqual(
            {model.provider for model in models},
            {"openai", "anthropic"},
        )

    def test_duplicate_models_are_removed(self):
        duplicate_source = FakeSource(
            "openai",
            [
                self.openai_models[0],
                self.openai_models[0],
            ],
        )

        scanner = ModelScanner(
            [duplicate_source]
        )

        models = scanner.scan()

        self.assertEqual(len(models), 1)

    def test_add_source(self):
        scanner = ModelScanner()

        scanner.add_source(self.openai)

        self.assertEqual(
            len(scanner.sources()),
            1,
        )

        self.assertEqual(
            scanner.scan(),
            self.openai_models,
        )

    def test_duplicate_source_not_added(self):
        scanner = ModelScanner(
            [self.openai]
        )

        scanner.add_source(self.openai)

        self.assertEqual(
            len(scanner.sources()),
            1,
        )

    def test_remove_source(self):
        scanner = ModelScanner(
            [
                self.openai,
                self.anthropic,
            ]
        )

        removed = scanner.remove_source(
            "openai"
        )

        self.assertTrue(removed)
        self.assertEqual(
            len(scanner.sources()),
            1,
        )

        self.assertEqual(
            scanner.sources()[0].provider,
            "anthropic",
        )

    def test_remove_missing_source(self):
        scanner = ModelScanner(
            [self.openai]
        )

        removed = scanner.remove_source(
            "missing"
        )

        self.assertFalse(removed)

    def test_index_initialization(self):
        index = ModelDiscoveryIndex(
            self.openai_models
        )

        self.assertEqual(
            index.count(),
            2,
        )

    def test_index_get(self):
        index = ModelDiscoveryIndex(
            self.openai_models
        )

        result = index.get(
            "openai:model-a"
        )

        self.assertEqual(
            result,
            self.openai_models[0],
        )

    def test_index_provider_lookup(self):
        index = ModelDiscoveryIndex(
            self.openai_models
            + self.anthropic_models
        )

        result = index.by_provider(
            "openai"
        )

        self.assertEqual(
            result,
            self.openai_models,
        )

    def test_index_providers(self):
        index = ModelDiscoveryIndex(
            self.openai_models
            + self.anthropic_models
        )

        self.assertEqual(
            index.providers(),
            {"openai", "anthropic"},
        )

    def test_index_add(self):
        index = ModelDiscoveryIndex()

        model = make_model(
            "google",
            "model-d",
        )

        index.add(model)

        self.assertEqual(
            index.get(
                "google:model-d"
            ),
            model,
        )

    def test_index_clear(self):
        index = ModelDiscoveryIndex(
            self.openai_models
        )

        index.clear()

        self.assertEqual(
            index.count(),
            0,
        )

    def test_discovery(self):
        scanner = ModelScanner(
            [
                self.openai,
                self.anthropic,
            ]
        )

        discovery = ModelDiscovery(
            scanner
        )

        models = discovery.discover()

        self.assertEqual(
            len(models),
            3,
        )

        self.assertEqual(
            discovery.count(),
            3,
        )

    def test_discovery_get(self):
        scanner = ModelScanner(
            [self.openai]
        )

        discovery = ModelDiscovery(
            scanner
        )

        discovery.discover()

        self.assertEqual(
            discovery.get(
                "openai:model-a"
            ),
            self.openai_models[0],
        )

    def test_discovery_by_provider(self):
        scanner = ModelScanner(
            [
                self.openai,
                self.anthropic,
            ]
        )

        discovery = ModelDiscovery(
            scanner
        )

        discovery.discover()

        self.assertEqual(
            discovery.by_provider("anthropic"),
            self.anthropic_models,
        )

    def test_refresh(self):
        scanner = ModelScanner(
            [self.openai]
        )

        discovery = ModelDiscovery(
            scanner
        )

        first = discovery.discover()
        second = discovery.refresh()

        self.assertEqual(
            first,
            second,
        )

        self.assertEqual(
            discovery.count(),
            2,
        )

    def test_non_model_source_output_rejected(self):
        bad_source = FakeSource(
            "bad",
            ["not-a-model"],
        )

        scanner = ModelScanner(
            [bad_source]
        )

        with self.assertRaises(TypeError):
            scanner.scan()

    def test_index_rejects_non_model(self):
        index = ModelDiscoveryIndex()

        with self.assertRaises(TypeError):
            index.add("not-a-model")


if __name__ == "__main__":
    unittest.main()
