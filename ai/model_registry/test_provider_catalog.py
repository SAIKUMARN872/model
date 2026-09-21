from __future__ import annotations

import unittest

from providers.base.models import (
    ModelCapability,
    ModelInfo,
    ProviderTier,
)

from model_registry.catalog.catalog import ModelCatalog
from model_registry.models import ModelTier
from model_registry.registry.manager import ModelRegistryManager
from model_registry.utils import model_info_to_record


class TestProviderToCatalog(unittest.TestCase):

    def setUp(self):
        self.registry = ModelRegistryManager()

        provider_model = ModelInfo(
            id="mock-model",
            provider="mock-provider",
            aliases=("mock", "latest"),
            tier=ProviderTier.MLM,
            capabilities=frozenset(
                {
                    ModelCapability.CHAT,
                    ModelCapability.REASONING,
                    ModelCapability.CODE,
                    ModelCapability.VISION,
                    ModelCapability.TOOL_USE,
                    ModelCapability.STREAMING,
                }
            ),
            context_window=128000,
            max_output_tokens=8192,
            input_cost_per_1m_tokens=0.50,
            output_cost_per_1m_tokens=1.50,
            estimated_latency_ms=250.0,
            quality_score=0.91,
            enabled=True,
        )

        canonical_model = model_info_to_record(
            provider_model
        )

        self.registry.register(canonical_model)
        self.catalog = ModelCatalog(self.registry)

    def test_provider_model_is_registered(self):
        model = self.registry.get(
            "mock-provider",
            "mock-model",
        )

        self.assertIsNotNone(model)
        self.assertEqual(
            model.model_id,
            "mock-model",
        )

    def test_catalog_finds_provider_model(self):
        result = self.catalog.search("mock-model")

        self.assertEqual(len(result), 1)
        self.assertEqual(
            result[0].provider,
            "mock-provider",
        )

    def test_catalog_finds_alias(self):
        result = self.catalog.search("mock")

        self.assertEqual(len(result), 1)
        self.assertEqual(
            result[0].model_id,
            "mock-model",
        )

    def test_canonical_tier_is_preserved(self):
        model = self.catalog.find_exact("mock-model")

        self.assertIsNotNone(model)
        self.assertEqual(
            model.tier,
            ModelTier.MLM,
        )

    def test_canonical_capabilities_are_preserved(self):
        model = self.catalog.find_exact("mock-model")

        self.assertIsNotNone(model)

        self.assertTrue(model.capabilities.chat)
        self.assertTrue(model.capabilities.reasoning)
        self.assertTrue(model.capabilities.code)
        self.assertTrue(model.capabilities.vision)
        self.assertTrue(model.capabilities.tool_use)
        self.assertTrue(model.capabilities.streaming)

    def test_catalog_filter_uses_normalized_capabilities(self):
        from model_registry.schemas import ModelQuery

        result = self.catalog.filter(
            ModelQuery(
                requires_vision=True,
                requires_reasoning=True,
                requires_tool_use=True,
            )
        )

        self.assertEqual(
            len(result),
            1,
        )
        self.assertEqual(
            result[0].model_id,
            "mock-model",
        )

    def test_cost_latency_quality_are_preserved(self):
        model = self.catalog.find_exact("mock-model")

        self.assertIsNotNone(model)

        self.assertEqual(
            model.pricing.input_per_1m_tokens,
            0.50,
        )
        self.assertEqual(
            model.pricing.output_per_1m_tokens,
            1.50,
        )
        self.assertEqual(
            model.latency_ms,
            250.0,
        )
        self.assertEqual(
            model.quality_score,
            0.91,
        )


if __name__ == "__main__":
    unittest.main()
