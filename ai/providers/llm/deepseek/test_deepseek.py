from __future__ import annotations

import asyncio
import unittest

from ai.providers.base.models import ProviderStatus
from ai.providers.llm.deepseek.provider import DeepSeekProvider


class DeepSeekProviderTest(unittest.TestCase):

    def test_model_catalog(self) -> None:
        provider = DeepSeekProvider()

        models = asyncio.run(
            provider.list_models()
        )

        self.assertEqual(
            len(models),
            2,
        )

        model_ids = {
            model.id
            for model in models
        }

        self.assertIn(
            "deepseek-chat",
            model_ids,
        )

        self.assertIn(
            "deepseek-reasoner",
            model_ids,
        )

    def test_model_support(self) -> None:
        provider = DeepSeekProvider()

        self.assertTrue(
            asyncio.run(
                provider.supports_model(
                    "deepseek-chat"
                )
            )
        )

        self.assertTrue(
            asyncio.run(
                provider.supports_model(
                    "deepseek-reasoner"
                )
            )
        )

        self.assertFalse(
            asyncio.run(
                provider.supports_model(
                    "invalid-model"
                )
            )
        )

    def test_provider_metadata(self) -> None:
        provider = DeepSeekProvider()

        metadata = provider.metadata

        self.assertEqual(
            provider.name,
            "deepseek",
        )

        self.assertEqual(
            metadata.provider_id,
            "deepseek",
        )

        self.assertEqual(
            metadata.display_name,
            "DeepSeek",
        )

        self.assertTrue(
            metadata.streaming_supported
        )

        self.assertTrue(
            metadata.tool_use_supported
        )

    def test_lifecycle_without_api_key(self) -> None:
        provider = DeepSeekProvider()

        asyncio.run(
            provider.initialize()
        )

        self.assertTrue(
            provider.initialized
        )

        health = asyncio.run(
            provider.health_check()
        )

        self.assertFalse(
            health.healthy
        )

        self.assertEqual(
            health.status,
            ProviderStatus.UNAVAILABLE,
        )

        asyncio.run(
            provider.close()
        )

        self.assertFalse(
            provider.initialized
        )


if __name__ == "__main__":
    unittest.main()
