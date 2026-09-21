import unittest

from providers.llm.anthropic.config import AnthropicConfig
from providers.llm.anthropic.models import (
    DEFAULT_ANTHROPIC_MODELS,
    AnthropicModel,
)
from providers.llm.anthropic.provider import AnthropicProvider
from providers.llm.anthropic.chat import AnthropicChat
from providers.llm.anthropic.stream import AnthropicStream
from providers.llm.anthropic.tokenizer import AnthropicTokenizer
from providers.llm.anthropic.utils import (
    calculate_cost,
    extract_finish_reason,
    extract_request_id,
    extract_text,
    extract_usage,
    normalize_messages,
    normalize_model_name,
    serialize_json,
    is_retryable_status,
)
from providers.base.models import ModelCapability, ProviderTier
from providers.base.request import ChatMessage


class TestAnthropicConfig(unittest.TestCase):

    def test_config_defaults(self):
        config = AnthropicConfig()

        self.assertEqual(config.provider_id, "anthropic")
        self.assertIsNone(config.api_key)
        self.assertEqual(config.timeout_seconds, 60.0)
        self.assertEqual(config.max_retries, 3)

    def test_config_values(self):
        config = AnthropicConfig(
            api_key="test-key",
            base_url="https://example.com",
            timeout_seconds=30.0,
            max_retries=5,
        )

        self.assertEqual(config.api_key, "test-key")
        self.assertEqual(config.base_url, "https://example.com")
        self.assertEqual(config.timeout_seconds, 30.0)
        self.assertEqual(config.max_retries, 5)

    def test_config_client_kwargs(self):
        config = AnthropicConfig(
            api_key="test-key",
            base_url="https://example.com",
            timeout_seconds=25.0,
            max_retries=4,
        )

        kwargs = config.client_kwargs()

        self.assertIsInstance(kwargs, dict)
        self.assertEqual(kwargs["api_key"], "test-key")
        self.assertEqual(kwargs["base_url"], "https://example.com")
        self.assertEqual(kwargs["max_retries"], 4)


class TestAnthropicModels(unittest.TestCase):

    def test_models_exist(self):
        self.assertTrue(DEFAULT_ANTHROPIC_MODELS)
        self.assertGreaterEqual(len(DEFAULT_ANTHROPIC_MODELS), 3)

    def test_model_metadata(self):
        for model in DEFAULT_ANTHROPIC_MODELS:
            self.assertIsInstance(model, AnthropicModel)
            self.assertIsInstance(model.model_id, str)
            self.assertTrue(model.model_id)
            self.assertIsInstance(model.display_name, str)
            self.assertIsInstance(model.tier, ProviderTier)
            self.assertGreater(model.context_window, 0)
            self.assertGreater(model.max_output_tokens, 0)
            self.assertGreaterEqual(model.input_cost_per_1k_tokens, 0.0)
            self.assertGreaterEqual(model.output_cost_per_1k_tokens, 0.0)
            self.assertGreaterEqual(model.latency_ms, 0.0)
            self.assertGreaterEqual(model.quality_score, 0.0)
            self.assertLessEqual(model.quality_score, 1.0)
            self.assertIsInstance(model.capabilities, frozenset)
            self.assertIsInstance(model.aliases, tuple)
            self.assertTrue(model.enabled)

    def test_model_ids_unique(self):
        model_ids = [model.model_id for model in DEFAULT_ANTHROPIC_MODELS]

        self.assertEqual(
            len(model_ids),
            len(set(model_ids)),
        )

    def test_model_capabilities(self):
        for model in DEFAULT_ANTHROPIC_MODELS:
            self.assertIn(ModelCapability.CHAT, model.capabilities)
            self.assertIn(ModelCapability.STREAMING, model.capabilities)
            self.assertIn(ModelCapability.TOOL_USE, model.capabilities)


class TestAnthropicUtils(unittest.TestCase):

    def test_normalize_model_name(self):
        self.assertEqual(
            normalize_model_name("  Claude-Sonnet-5  "),
            "Claude-Sonnet-5",
        )

    def test_normalize_model_name_invalid(self):
        with self.assertRaises(TypeError):
            normalize_model_name(123)

        with self.assertRaises(ValueError):
            normalize_model_name("   ")

    def test_normalize_messages(self):
        messages = [
            {
                "role": "system",
                "content": "You are ModelNow.",
            },
            {
                "role": "user",
                "content": "Hello ModelNow",
            },
            {
                "role": "assistant",
                "content": "Hello!",
            },
        ]

        system, normalized = normalize_messages(messages)

        self.assertEqual(system, "You are ModelNow.")
        self.assertIsInstance(normalized, list)
        self.assertEqual(len(normalized), 2)
        self.assertEqual(normalized[0]["role"], "user")
        self.assertEqual(normalized[0]["content"], "Hello ModelNow")
        self.assertEqual(normalized[1]["role"], "assistant")

    def test_normalize_messages_multiple_system(self):
        messages = [
            {"role": "system", "content": "First instruction"},
            {"role": "system", "content": "Second instruction"},
            {"role": "user", "content": "Hello"},
        ]

        system, normalized = normalize_messages(messages)

        self.assertEqual(
            system,
            "First instruction\n\nSecond instruction",
        )
        self.assertEqual(len(normalized), 1)

    def test_normalize_messages_invalid_role(self):
        messages = [
            {
                "role": "developer",
                "content": "Invalid role",
            }
        ]

        with self.assertRaises(ValueError):
            normalize_messages(messages)

    def test_normalize_messages_invalid_message(self):
        with self.assertRaises(TypeError):
            normalize_messages([123])

    def test_normalize_messages_chat_message(self):
        messages = [
            ChatMessage(
                role="user",
                content="Hello from ChatMessage",
            )
        ]

        system, normalized = normalize_messages(messages)

        self.assertIsNone(system)
        self.assertEqual(
            normalized,
            [
                {
                    "role": "user",
                    "content": "Hello from ChatMessage",
                }
            ],
        )

    def test_extract_text(self):
        response = {
            "content": [
                {
                    "type": "text",
                    "text": "Hello ",
                },
                {
                    "type": "text",
                    "text": "ModelNow",
                },
            ]
        }

        self.assertEqual(
            extract_text(response),
            "Hello ModelNow",
        )

    def test_extract_text_ignores_non_text_blocks(self):
        response = {
            "content": [
                {
                    "type": "text",
                    "text": "Hello",
                },
                {
                    "type": "tool_use",
                    "id": "tool-1",
                    "name": "test",
                    "input": {},
                },
                "invalid",
            ]
        }

        self.assertEqual(
            extract_text(response),
            "Hello",
        )

    def test_extract_usage(self):
        response = {
            "usage": {
                "input_tokens": 120,
                "output_tokens": 80,
            }
        }

        usage = extract_usage(response)

        self.assertEqual(
            usage,
            {
                "input_tokens": 120,
                "output_tokens": 80,
                "total_tokens": 200,
            },
        )

    def test_extract_usage_missing(self):
        usage = extract_usage({})

        self.assertEqual(
            usage,
            {
                "input_tokens": 0,
                "output_tokens": 0,
                "total_tokens": 0,
            },
        )

    def test_extract_finish_reason(self):
        self.assertEqual(
            extract_finish_reason(
                {"stop_reason": "end_turn"}
            ),
            "end_turn",
        )

        self.assertIsNone(
            extract_finish_reason({})
        )

    def test_extract_request_id(self):
        self.assertEqual(
            extract_request_id(
                {"request_id": "req-anthropic-001"}
            ),
            "req-anthropic-001",
        )

        self.assertEqual(
            extract_request_id(
                {"id": "msg-anthropic-001"}
            ),
            "msg-anthropic-001",
        )

        self.assertIsNone(
            extract_request_id({})
        )

    def test_serialize_json(self):
        value = {
            "provider": "anthropic",
            "message": "Hello ModelNow",
        }

        result = serialize_json(value)

        self.assertIsInstance(result, str)
        self.assertIn('"provider":"anthropic"', result)
        self.assertIn('"message":"Hello ModelNow"', result)

    def test_calculate_cost(self):
        cost = calculate_cost(
            input_tokens=1_000_000,
            output_tokens=500_000,
            input_cost_per_1m_tokens=3.0,
            output_cost_per_1m_tokens=15.0,
        )

        self.assertAlmostEqual(
            cost,
            10.5,
            places=6,
        )

    def test_calculate_cost_zero(self):
        self.assertEqual(
            calculate_cost(0, 0, 3.0, 15.0),
            0.0,
        )

    def test_retryable_status(self):
        retryable = [
            408,
            409,
            429,
            500,
            502,
            503,
            504,
        ]

        for status in retryable:
            self.assertTrue(
                is_retryable_status(status),
                msg=f"{status} should be retryable",
            )

        self.assertFalse(is_retryable_status(400))
        self.assertFalse(is_retryable_status(401))
        self.assertFalse(is_retryable_status(403))
        self.assertFalse(is_retryable_status(404))


class TestAnthropicProvider(unittest.TestCase):

    def test_provider_creation(self):
        provider = AnthropicProvider(
            AnthropicConfig(api_key="test-key")
        )

        self.assertIsInstance(provider, AnthropicProvider)
        self.assertEqual(provider.metadata.provider_id, "anthropic")

    def test_provider_creation_with_base_config(self):
        provider = AnthropicProvider(
            AnthropicConfig(api_key="test-key")
        )

        self.assertIsNotNone(provider)
        self.assertEqual(
            provider.config.provider_id,
            "anthropic",
        )


class TestAnthropicClasses(unittest.TestCase):

    def test_chat_class_exists(self):
        self.assertTrue(callable(AnthropicChat))

    def test_stream_class_exists(self):
        self.assertTrue(callable(AnthropicStream))

    def test_tokenizer_class_exists(self):
        self.assertTrue(callable(AnthropicTokenizer))


if __name__ == "__main__":
    unittest.main()
