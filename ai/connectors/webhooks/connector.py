"""Configured outbound webhook connector."""
import os

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorMetadata, ConnectorResult
from .client import WebhookClient
from .config import WebhookConfig
from .schemas import validate_webhook_arguments


class WebhookConnector(Connector):
    def __init__(self, config, client=None):
        if not isinstance(config, WebhookConfig):
            raise TypeError("config must be WebhookConfig")
        self.config = config
        self.client = client or WebhookClient(config.timeout_seconds)
        self._operations = {item.name: item for item in config.operations}
        schemas = {
            name: {
                "type": "object",
                "properties": {
                    "payload": {"type": "object"},
                },
                "required": ["payload"],
                "additionalProperties": False,
            }
            for name in self._operations
        }
        super().__init__(ConnectorMetadata(
            name="webhooks",
            version="1.0.0",
            description="Deliver JSON payloads to explicitly configured HTTPS webhook endpoints.",
            operations=tuple(schemas),
            operation_schemas=schemas,
            required_permissions=config.required_permissions,
        ))

    async def execute(self, request, credentials):
        operation = request.operation
        try:
            item, payload = validate_webhook_arguments(
                operation, request.arguments or {}, self.config
            )
            if not self.config.enable_delivery:
                raise ConnectorValidationError(
                    "Webhook delivery is disabled; explicitly enable it in configuration."
                )
            credentials = credentials or {}
            secret = credentials.get("signing_secret")
            if item.signing_secret_env_var:
                secret = secret or os.environ.get(item.signing_secret_env_var)
                if not secret:
                    raise ConnectorValidationError("Configured webhook signing secret is missing.")
            result = self.client.deliver(
                item.url,
                item.allowed_hosts,
                payload,
                signing_secret=secret,
                headers=item.headers,
            )
            return ConnectorResult("webhooks", operation, True, data=result)
        except (ConnectorError, ConnectorValidationError, ValueError) as exc:
            return ConnectorResult("webhooks", operation, False, error=str(exc))
        except Exception:
            return ConnectorResult("webhooks", operation, False, error="Webhook delivery failed.")
