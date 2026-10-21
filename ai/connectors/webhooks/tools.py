"""Register the webhook connector."""
from ai.connectors.registry import ConnectorRegistry
from .connector import WebhookConnector


def register_webhooks_connector(registry, config, *, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    connector = WebhookConnector(config, client=client)
    registry.register(connector)
    return connector


__all__ = ["register_webhooks_connector"]
