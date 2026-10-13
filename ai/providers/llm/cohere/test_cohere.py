from __future__ import annotations

import asyncio
import unittest

from ai.providers.base.config import ProviderConfig
from ai.providers.base.request import (
    ChatMessage,
    ChatRequest,
)
from ai.providers.base.response import (
    ChatResponse,
    ChatUsage,
)

from .config import CohereConfig
from .models import (
    COHERE_MODELS,
    get_model,
    is_supported_model,
    list_models,
)
from .provider import CohereProvider
from .tokenizer import CohereTokenizer
from .utils import (
    build_chat_payload,
    extract_content,
    extract_finish_reason,
    extract_request_id,
    extract_usage,
)


class CohereProviderTests(unittest.TestCase):
    """Offline tests for the ModelNow Cohere provider."""

    def test_config_without_api_key(self) -> None:
        config = CohereConfig.from_env()

        self.assertFalse(config.configured)

    def test_shared_provider_config(self) -> None:
        config = ProviderConfig(
            provider_id="cohere",
            api_key=None,
            enabled=True,
        )

        self.assertEqual(
            config.provider_id,
            "cohere",
        )

        self.assertTrue(config.enabled)

    def test_models_exist(self) -> None:
        self.assertGreaterEqual(
            len(COHERE_MODELS),
            1,
        )

    def test_model_lookup(self) -> None:
        model = get_model(
            "command-a-plus-05-2026"
        )

        self.assertIsNotNone(model)

    def test_model_support(self) -> None:
        self.assertTrue(
            is_supported_model(
                "command-a-plus-05-2026"
            )
        )

    def test_model_listing(self) -> None:
        models = list_models()

        self.assertEqual(
            len(models),
            len(COHERE_MODELS),
        )

    def test_chat_request(self) -> None:
        request = ChatRequest(
            model="command-a-plus-05-2026",
            messages=[
                ChatMessage(
                    role="user",
                    content="Hello Cohere",
                )
            ],
            temperature=0.2,
            max_tokens=100,
        )

        self.assertEqual(
            request.model,
            "command-a-plus-05-2026",
        )

        self.assertEqual(
            request.message_count,
            1,
        )

    def test_payload(self) -> None:
        request = ChatRequest(
            model="command-a-plus-05-2026",
            messages=[
                ChatMessage(
                    role="user",
                    content="Hello",
                )
            ],
            temperature=0.2,
            max_tokens=100,
        )

        payload = build_chat_payload(request)

        self.assertEqual(
            payload["model"],
            "command-a-plus-05-2026",
        )

        self.assertEqual(
            payload["temperature"],
            0.2,
        )

        self.assertEqual(
            payload["max_tokens"],
            100,
        )

        self.assertEqual(
            payload["messages"][0]["role"],
            "user",
        )

    def test_response_extraction(self) -> None:
        response = {
            "id": "test-request-id",
            "message": {
                "role": "assistant",
                "content": [
                    {
                        "type": "text",
                        "text": "Hello from Cohere",
                    }
                ],
            },
            "finish_reason": "COMPLETE",
            "usage": {
                "billed_units": {
                    "input_tokens": 10,
                    "output_tokens": 5,
                }
            },
        }

        self.assertEqual(
            extract_content(response),
            "Hello from Cohere",
        )

        self.assertEqual(
            extract_finish_reason(response),
            "COMPLETE",
        )

        self.assertEqual(
            extract_request_id(response),
            "test-request-id",
        )

        usage = extract_usage(response)

        self.assertEqual(
            usage["input_tokens"],
            10,
        )

        self.assertEqual(
            usage["output_tokens"],
            5,
        )

        self.assertEqual(
            usage["total_tokens"],
            15,
        )

    def test_tokenizer(self) -> None:
        tokenizer = CohereTokenizer()

        tokens = tokenizer.count_tokens(
            "This is a simple test sentence."
        )

        self.assertGreater(
            tokens,
            0,
        )

    def test_provider_construction(self) -> None:
        config = ProviderConfig(
            provider_id="cohere",
            api_key=None,
            enabled=True,
        )

        provider = CohereProvider(
            config
        )

        self.assertEqual(
            provider.name,
            "Cohere",
        )

        self.assertEqual(
            provider.version,
            "1.0.0",
        )

        self.assertFalse(
            provider.initialized
        )

    def test_provider_lifecycle(self) -> None:
        async def run() -> None:
            config = ProviderConfig(
                provider_id="cohere",
                api_key=None,
                enabled=True,
            )

            provider = CohereProvider(
                config
            )

            await provider.initialize()

            self.assertTrue(
                provider.initialized
            )

            await provider.close()

            self.assertFalse(
                provider.initialized
            )

        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
