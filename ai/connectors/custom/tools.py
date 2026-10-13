"""Registration helpers for custom connectors."""

from ai.connectors.registry import ConnectorRegistry
from .config import CustomConnectorConfig
from .connector import CustomConnector


def register_custom_connector(
    registry: ConnectorRegistry,
    config: CustomConnectorConfig,
    *,
    client=None,
) -> CustomConnector:
    """Construct and register a custom connector."""
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry.")
    connector = CustomConnector(config, client=client)
    registry.register(connector)
    return connector
