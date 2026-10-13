"""HubSpot CRM connector public API."""

from ai.connectors.hubspot.client import HubSpotClient
from ai.connectors.hubspot.config import (
    HUBSPOT_ALLOWED_HOSTS,
    HUBSPOT_API_BASE_URL,
    HubSpotConnectorConfig,
)
from ai.connectors.hubspot.connector import HubSpotConnector
from ai.connectors.hubspot.tools import (
    create_hubspot_client,
    register_hubspot_connector,
)

__all__ = [
    "HUBSPOT_ALLOWED_HOSTS",
    "HUBSPOT_API_BASE_URL",
    "HubSpotClient",
    "HubSpotConnector",
    "HubSpotConnectorConfig",
    "create_hubspot_client",
    "register_hubspot_connector",
]
