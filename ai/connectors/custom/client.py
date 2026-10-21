"""Custom connector HTTP client factory."""

from ai.connectors.client import ConnectorHTTPClient
from .config import CustomConnectorConfig


def create_custom_http_client(
    config: CustomConnectorConfig,
) -> ConnectorHTTPClient:
    """Create the shared allowlisted HTTPS client for a custom connector."""
    if not isinstance(config, CustomConnectorConfig):
        raise TypeError("config must be CustomConnectorConfig.")
    return ConnectorHTTPClient(config.transport)
