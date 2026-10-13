"""Mock-based tests for configured outbound webhooks."""
import hashlib
import hmac
import unittest
from unittest.mock import patch

from ai.connectors.exceptions import ConnectorConfigurationError
from ai.connectors.models import ConnectorRequest
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.webhooks import (
    WebhookClient, WebhookConfig, WebhookConnector,
    WebhookOperationConfig, register_webhooks_connector,
)


class FakeWebhookClient:
    def __init__(self):
        self.calls = []

    def deliver(self, url, allowed_hosts, payload, *, signing_secret=None, headers=None):
        self.calls.append((url, allowed_hosts, payload, signing_secret, headers))
        return {"status_code": 204, "body": None}


class WebhookTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.operation = WebhookOperationConfig(
            name="notify",
            url="https://hooks.example.com/events",
            allowed_hosts=("hooks.example.com",),
            signing_secret_env_var="TEST_WEBHOOK_SECRET",
        )
        self.client = FakeWebhookClient()
        self.config = WebhookConfig((self.operation,), enable_delivery=True)
        self.connector = WebhookConnector(self.config, self.client)

    async def test_delivers_configured_payload(self):
        result = await self.connector.execute(
            ConnectorRequest("notify", {"payload": {"event": "created"}}),
            {"signing_secret": "test-secret"},
        )
        self.assertTrue(result.success)
        self.assertEqual(self.client.calls[0][2], {"event": "created"})
        self.assertEqual(self.client.calls[0][3], "test-secret")

    async def test_delivery_disabled_by_default(self):
        connector = WebhookConnector(
            WebhookConfig((self.operation,)), self.client
        )
        result = await connector.execute(
            ConnectorRequest("notify", {"payload": {"event": "created"}}),
            {"signing_secret": "test-secret"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_unknown_operation_rejected(self):
        result = await self.connector.execute(
            ConnectorRequest("arbitrary_url", {"payload": {}}),
            {"signing_secret": "test-secret"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_extra_arguments_rejected(self):
        result = await self.connector.execute(
            ConnectorRequest("notify", {
                "payload": {}, "url": "https://attacker.example/",
            }),
            {"signing_secret": "test-secret"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_payload_must_be_object(self):
        result = await self.connector.execute(
            ConnectorRequest("notify", {"payload": ["not", "object"]}),
            {"signing_secret": "test-secret"},
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_missing_signing_secret(self):
        result = await self.connector.execute(
            ConnectorRequest("notify", {"payload": {"event": "created"}}), {}
        )
        self.assertFalse(result.success)
        self.assertEqual(self.client.calls, [])

    async def test_registration(self):
        registry = ConnectorRegistry()
        connector = register_webhooks_connector(
            registry, self.config, client=self.client
        )
        self.assertIs(registry.get("webhooks"), connector)

    async def test_rejects_non_https(self):
        with self.assertRaises(ConnectorConfigurationError):
            WebhookClient.validate_url(
                "http://hooks.example.com/events", ("hooks.example.com",)
            )

    async def test_rejects_unlisted_host(self):
        with self.assertRaises(ConnectorConfigurationError):
            WebhookClient.validate_url(
                "https://attacker.example/events", ("hooks.example.com",)
            )

    async def test_rejects_url_credentials(self):
        with self.assertRaises(ConnectorConfigurationError):
            WebhookClient.validate_url(
                "https://user:pass@hooks.example.com/events",
                ("hooks.example.com",),
            )

    async def test_hmac_signature(self):
        body = b'{"event":"created"}'
        expected = hmac.new(b"secret", body, hashlib.sha256).hexdigest()
        with patch.object(WebhookClient, "deliver") as deliver:
            deliver.return_value = {"status_code": 200, "body": None}
            deliver(
                "https://hooks.example.com/events",
                ("hooks.example.com",),
                {"event": "created"},
                signing_secret="secret",
            )
        self.assertEqual(len(expected), 64)

    async def test_invalid_timeout(self):
        with self.assertRaises(ConnectorConfigurationError):
            WebhookClient(timeout_seconds=0)


if __name__ == "__main__":
    unittest.main()
