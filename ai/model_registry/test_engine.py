from __future__ import annotations

import unittest

from .engine import ModelRegistryEngine
from .models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)


class TestModelRegistryEngine(unittest.TestCase):

    def setUp(self) -> None:
        self.engine = ModelRegistryEngine()

        self.model = ModelRecord(
            provider="test-provider",
            model_id="test-model",
            display_name="Test Model",
            tier=ModelTier.MLM,
            context_window=32000,
            max_output_tokens=4096,
            pricing=ModelPricing(
                input_per_1m_tokens=1.0,
                output_per_1m_tokens=2.0,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                code=True,
                streaming=True,
            ),
        )

    def tearDown(self) -> None:
        self.engine.clear()

    def test_register(self) -> None:
        result = self.engine.register(self.model)

        self.assertEqual(
            result,
            self.model,
        )
        self.assertEqual(
            self.engine.count(),
            1,
        )

    def test_register_many(self) -> None:
        models = [
            self.model,
            ModelRecord(
                provider="test-provider",
                model_id="second-model",
                display_name="Second Model",
            ),
        ]

        result = self.engine.register_many(models)

        self.assertEqual(
            len(result),
            2,
        )
        self.assertEqual(
            self.engine.count(),
            2,
        )

    def test_get(self) -> None:
        self.engine.register(self.model)

        result = self.engine.get(
            "test-provider",
            "test-model",
        )

        self.assertEqual(
            result,
            self.model,
        )

    def test_get_missing(self) -> None:
        result = self.engine.get(
            "missing-provider",
            "missing-model",
        )

        self.assertIsNone(result)

    def test_get_by_id(self) -> None:
        self.engine.register(self.model)

        result = self.engine.get_by_id(
            "test-provider:test-model"
        )

        self.assertEqual(
            result,
            self.model,
        )

    def test_find(self) -> None:
        self.engine.register(self.model)

        result = self.engine.find(
            "Test Model"
        )

        self.assertEqual(
            len(result),
            1,
        )
        self.assertEqual(
            result[0],
            self.model,
        )

    def test_list_models(self) -> None:
        self.engine.register(self.model)

        result = self.engine.list_models()

        self.assertEqual(
            result,
            [self.model],
        )

    def test_remove(self) -> None:
        self.engine.register(self.model)

        result = self.engine.remove(
            "test-provider",
            "test-model",
        )

        self.assertEqual(
            result,
            self.model,
        )
        self.assertEqual(
            self.engine.count(),
            0,
        )

    def test_remove_missing(self) -> None:
        result = self.engine.remove(
            "missing-provider",
            "missing-model",
        )

        self.assertIsNone(result)

    def test_providers(self) -> None:
        self.engine.register(self.model)
        self.engine.register(
            ModelRecord(
                provider="second-provider",
                model_id="second-model",
                display_name="Second Model",
            )
        )

        providers = self.engine.providers()

        self.assertEqual(
            providers,
            {"test-provider", "second-provider"},
        )
    def test_clear(self) -> None:
        self.engine.register(self.model)

        self.assertEqual(
            self.engine.count(),
            1,
        )

        self.engine.clear()

        self.assertEqual(
            self.engine.count(),
            0,
        )

    def test_custom_manager(self) -> None:
        from .registry.manager import ModelRegistryManager

        manager = ModelRegistryManager()
        engine = ModelRegistryEngine(
            manager=manager
        )

        self.assertIs(
            engine.manager,
            manager,
        )


if __name__ == "__main__":
    unittest.main()

