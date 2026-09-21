from __future__ import annotations

import unittest

from providers.base.models import (
    ModelCapability,
    ModelInfo,
    ProviderTier,
)

from model_registry.models import (
    ModelTier,
)

from model_registry.utils import (
    model_info_to_record,
    normalize_features,
    normalize_tier,
)


class ModelRegistryUtilsTests(unittest.TestCase):

    def test_normalize_tier(self):
        self.assertEqual(
            normalize_tier(ProviderTier.SLM),
            ModelTier.SLM,
        )
        self.assertEqual(
            normalize_tier(ProviderTier.MLM),
            ModelTier.MLM,
        )
        self.assertEqual(
            normalize_tier(ProviderTier.LLM),
            ModelTier.LLM,
        )

    def test_normalize_features(self):
        features = normalize_features(
            {
                ModelCapability.CHAT,
                ModelCapability.CODE,
                ModelCapability.VISION,
                ModelCapability.STREAMING,
            }
        )

        self.assertEqual(
            {
                "chat",
                "code",
                "vision",
                "streaming",
            },
            {feature.value for feature in features},
        )

    def test_unsupported_provider_features_are_ignored(self):
        features = normalize_features(
            {
                ModelCapability.CHAT,
                ModelCapability.IMAGE_GENERATION,
                ModelCapability.RAG,
            }
        )

        self.assertEqual(
            {"chat"},
            {feature.value for feature in features},
        )

    def test_model_info_to_record(self):
        model = ModelInfo(
            id="test-model",
            provider="test-provider",
            aliases=("test", "latest"),
            tier=ProviderTier.MLM,
            capabilities=frozenset(
                {
                    ModelCapability.CHAT,
                    ModelCapability.REASONING,
                    ModelCapability.CODE,
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
            metadata={"source": "unit-test"},
        )

        record = model_info_to_record(model)

        self.assertEqual(
            record.provider,
            "test-provider",
        )
        self.assertEqual(
            record.model_id,
            "test-model",
        )
        self.assertEqual(
            record.tier,
            ModelTier.MLM,
        )
        self.assertEqual(
            record.context_window,
            128000,
        )
        self.assertEqual(
            record.max_output_tokens,
            8192,
        )
        self.assertEqual(
            record.pricing.input_per_1m_tokens,
            0.50,
        )
        self.assertEqual(
            record.pricing.output_per_1m_tokens,
            1.50,
        )
        self.assertEqual(
            record.latency_ms,
            250.0,
        )
        self.assertEqual(
            record.quality_score,
            0.91,
        )
        self.assertEqual(
            record.aliases,
            ("test", "latest"),
        )
        self.assertTrue(record.enabled)
        self.assertTrue(record.available)
        self.assertEqual(
            record.metadata["source"],
            "unit-test",
        )

        self.assertTrue(
            record.capabilities.chat
        )
        self.assertTrue(
            record.capabilities.reasoning
        )
        self.assertTrue(
            record.capabilities.code
        )
        self.assertTrue(
            record.capabilities.tool_use
        )
        self.assertTrue(
            record.capabilities.streaming
        )

    def test_invalid_model_info(self):
        with self.assertRaises(TypeError):
            model_info_to_record("not-a-model")

    def test_invalid_tier(self):
        with self.assertRaises(TypeError):
            normalize_tier("llm")


if __name__ == "__main__":
    unittest.main()
