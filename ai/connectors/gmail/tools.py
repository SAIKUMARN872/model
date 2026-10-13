"""Gmail client factory."""

from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.gmail.client import GmailClient
from ai.connectors.gmail.config import GmailConnectorConfig


def create_gmail_client(config=None):
    config = config or GmailConnectorConfig()
    return GmailClient(ConnectorHTTPClient(config.transport))
