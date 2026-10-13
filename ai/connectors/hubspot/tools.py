"""HubSpot connector registration helpers."""

from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.config import ConnectorConfig
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.hubspot.client import HubSpotClient
from ai.connectors.hubspot.config import (
    HUBSPOT_ALLOWED_HOSTS,
    HUBSPOT_API_BASE_URL,
    HubSpotConnectorConfig,
)
from ai.connectors.hubspot.connector import HubSpotConnector


def create_hubspot_client(config=None):
    settings = config or HubSpotConnectorConfig()
    return HubSpotClient(ConnectorHTTPClient(settings.transport))


def register_hubspot_connector(registry, config=None, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    settings = config or HubSpotConnectorConfig()
    api_client = client or create_hubspot_client(settings)
    connector = HubSpotConnector(settings, api_client)
    registry.register(connector)
    return connector


__all__ = [
    "HUBSPOT_ALLOWED_HOSTS",
    "HUBSPOT_API_BASE_URL",
    "HubSpotClient",
    "HubSpotConnector",
    "HubSpotConnectorConfig",
    "create_hubspot_client",
    "register_hubspot_connector",
]
