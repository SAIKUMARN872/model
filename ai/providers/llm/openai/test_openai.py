from __future__ import annotations

import unittest

from providers.base.config import ProviderConfig
from providers.llm.openai.config import OpenAIConfig
from providers.llm.openai.client import OpenAIClient
from providers.llm.openai.chat import OpenAIChat
from providers.llm.openai.models import OpenAIModel
from providers.llm.openai.provider import OpenAIProvider
from providers.llm.openai.stream import OpenAIStream
from providers.llm.openai.tokenizer import OpenAITokenizer
from providers.llm.openai.utils import (
    normalize_model_name,
    normalize_messages,
    build_chat_payload,
    extract_text,
    extract_usage,
    extract_finish_reason,
    extract_request_id,
    extract_system_fingerprint,
    serialize_json,
    calculate_cost,
    merge_metadata,
    is_retryable_status,
)


class TestOpenAIConfig(unittest.TestCase):

    def test_config_defaults(self):
        config = OpenAIConfig()

        self.assertIsNone(config.api_key)
        self.assertIsNone(config.organization)
        self.assertIsNone(config.project)
        self.assertIsNone(config.base_url)
        self.assertEqual(config.timeout_seconds, 60.0)
        self.assertEqual(config.max_retries, 3)

    def test_config_with_values(self):
        config = OpenAIConfig(
            api_key="local-test-key",
            organization="test-org",
            project="test-project",
            base_url="https://example.invalid/v1",
            timeout_seconds=30.0,
            max_retries=5,
        )

        self.assertEqual(config.api_key, "local-test-key")
        self.assertEqual(config.organization, "test-org")
        self.assertEqual(config.project, "test-project")
        self.assertEqual(config.base_url, "https://example.invalid/v1")
        self.assertEqual(config.timeout_seconds, 30.0)
        self.assertEqual(config.max_retries, 5)


class TestOpenAIModels(unittest.TestCase):

    def test_model_class_exists(self):
        self.assertIsNotNone(OpenAIModel)


class TestOpenAIUtils(unittest.TestCase):

    def test_normalize_model_name(self):
        self.assertEqual(
            normalize_model_name("  gpt-4o  "),
            "gpt-4o",
        )

    def test_normalize_model_name_rejects_empty(self):
        with self.assertRaises(ValueError):
            normalize_model_name("")

    def test_normalize_model_name_rejects_non_string(self):
        with self.assertRaises(TypeError):
            normalize_model_name(None)

    def test_normalize_messages_from_dict(self):
        messages = normalize_messages(
            [
                {
                    "role": "user",
                    "content": "Hello",
                }
            ]
        )

        self.assertEqual(
            messages,
            [
                {
                    "role": "user",
                    "content": "Hello",
                }
            ],
        )

    def test_normalize_messages_multiple(self):
        messages = normalize_messages(
            [
                {
                    "role": "system",
                    "content": "You are helpful.",
                },
                {
                    "role": "user",
                    "content": "Hello",
                },
            ]
        )

        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0]["role"], "system")
        self.assertEqual(messages[1]["role"], "user")

    def test_normalize_messages_rejects_invalid_message(self):
        with self.assertRaises(TypeError):
            normalize_messages([123])

    def test_normalize_messages_rejects_missing_role(self):
        with self.assertRaises(ValueError):
            normalize_messages(
                [
                    {
                        "content": "Hello",
                    }
                ]
            )

    def test_build_chat_payload(self):
        payload = build_chat_payload(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": "Hello",
                }
            ],
        )

        self.assertEqual(payload["model"], "gpt-4o")
        self.assertEqual(len(payload["messages"]), 1)
        self.assertNotIn("stream", payload)

    def test_build_chat_payload_with_options(self):
        payload = build_chat_payload(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": "Hello",
                }
            ],
            temperature=0.2,
            max_tokens=100,
            stream=True,
            tools=[
                {
                    "type": "function",
                }
            ],
            metadata={
                "source": "local-test",
            },
        )

        self.assertEqual(payload["temperature"], 0.2)
        self.assertEqual(payload["max_tokens"], 100)
        self.assertTrue(payload["stream"])
        self.assertIn("tools", payload)
        self.assertEqual(
            payload["metadata"]["source"],
            "local-test",
        )

    def test_extract_text(self):
        response = {
            "choices": [
                {
                    "message": {
                        "content": "Hello from OpenAI",
                    }
                }
            ]
        }

        self.assertEqual(
            extract_text(response),
            "Hello from OpenAI",
        )

    def test_extract_text_empty_response(self):
        self.assertEqual(
            extract_text({}),
            "",
        )

    def test_extract_usage(self):
        response = {
            "usage": {
                "prompt_tokens": 10,
                "completion_tokens": 20,
                "total_tokens": 30,
            }
        }

        usage = extract_usage(response)

        self.assertEqual(usage["input_tokens"], 10)
        self.assertEqual(usage["output_tokens"], 20)
        self.assertEqual(usage["total_tokens"], 30)

    def test_extract_finish_reason(self):
        response = {
            "choices": [
                {
                    "finish_reason": "stop",
                }
            ]
        }

        self.assertEqual(
            extract_finish_reason(response),
            "stop",
        )

    def test_extract_request_id(self):
        response = {
            "id": "local-request-id",
        }

        self.assertEqual(
            extract_request_id(response),
            "local-request-id",
        )

    def test_extract_system_fingerprint(self):
        response = {
            "system_fingerprint": "fp-test",
        }

        self.assertEqual(
            extract_system_fingerprint(response),
            "fp-test",
        )

    def test_serialize_json(self):
        result = serialize_json(
            {
                "model": "gpt-4o",
                "value": 123,
            }
        )

        self.assertIn('"model":"gpt-4o"', result)
        self.assertIn('"value":123', result)

    def test_calculate_cost(self):
        cost = calculate_cost(
            input_tokens=1_000_000,
            output_tokens=500_000,
            input_cost_per_1m_tokens=1.0,
            output_cost_per_1m_tokens=2.0,
        )

        self.assertEqual(cost, 2.0)

    def test_merge_metadata(self):
        base = {
            "environment": "test",
            "version": 1,
        }

        extra = {
            "request_type": "chat",
        }

        result = merge_metadata(base, extra)

        self.assertEqual(
            result,
            {
                "environment": "test",
                "version": 1,
                "request_type": "chat",
            },
        )

        self.assertEqual(
            base,
            {
                "environment": "test",
                "version": 1,
            },
        )

    def test_retryable_status(self):
        self.assertTrue(is_retryable_status(429))
        self.assertTrue(is_retryable_status(500))
        self.assertTrue(is_retryable_status(503))
        self.assertFalse(is_retryable_status(400))
        self.assertFalse(is_retryable_status(401))


class TestOpenAIClient(unittest.TestCase):

    def test_client_initialization_without_network(self):
        provider_config = ProviderConfig(
            provider_id="openai",
            api_key="local-test-key",
        )

        openai_config = OpenAIConfig(
            api_key="local-test-key",
        )

        client = OpenAIClient(
            provider_config,
            openai_config,
        )

        self.assertIsNotNone(client)


class TestOpenAIChat(unittest.TestCase):

    def test_chat_initialization(self):
        provider_config = ProviderConfig(
            provider_id="openai",
            api_key="local-test-key",
        )

        openai_config = OpenAIConfig(
            api_key="local-test-key",
        )

        client = OpenAIClient(
            provider_config,
            openai_config,
        )

        chat = OpenAIChat(client)

        self.assertIsNotNone(chat)


class TestOpenAIProvider(unittest.TestCase):

    def test_provider_initialization_without_network(self):
        provider_config = ProviderConfig(
            provider_id="openai",
            api_key="local-test-key",
        )

        openai_config = OpenAIConfig(
            api_key="local-test-key",
        )

        provider = OpenAIProvider(
            provider_config,
            openai_config,
        )

        self.assertIsNotNone(provider)


class TestOpenAIStream(unittest.TestCase):

    def test_stream_class_exists(self):
        self.assertIsNotNone(OpenAIStream)


class TestOpenAITokenizer(unittest.TestCase):

    def test_tokenizer_class_exists(self):
        self.assertIsNotNone(OpenAITokenizer)


if __name__ == "__main__":
    unittest.main(verbosity=2)

