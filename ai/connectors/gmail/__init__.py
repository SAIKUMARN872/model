"""Gmail connector public API."""

from ai.connectors.gmail.client import GmailClient
from ai.connectors.gmail.config import (
    GMAIL_ALLOWED_HOSTS,
    GMAIL_API_BASE_URL,
    GmailConnectorConfig,
)
from ai.connectors.gmail.connector import GmailConnector
from ai.connectors.gmail.models import GmailOperation
from ai.connectors.gmail.schemas import (
    build_gmail_metadata,
    build_gmail_operations,
    validate_gmail_arguments,
)
from ai.connectors.gmail.tools import create_gmail_client


def register_gmail_connector(registry, config=None, client=None):
    config = config or GmailConnectorConfig()
    client = client or create_gmail_client(config)
    connector = GmailConnector(config, client)
    registry.register(connector)
    return connector


__all__ = [
    "GMAIL_ALLOWED_HOSTS",
    "GMAIL_API_BASE_URL",
    "GmailClient",
    "GmailConnector",
    "GmailConnectorConfig",
    "GmailOperation",
    "build_gmail_metadata",
    "build_gmail_operations",
    "create_gmail_client",
    "register_gmail_connector",
    "validate_gmail_arguments",
]
