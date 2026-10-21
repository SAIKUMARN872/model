"""Microsoft Outlook connector registration helpers."""

from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.microsoft_outlook.client import MicrosoftOutlookClient
from ai.connectors.microsoft_outlook.config import (
    MicrosoftOutlookConfig,
    create_microsoft_outlook_config,
)
from ai.connectors.microsoft_outlook.connector import MicrosoftOutlookConnector


def create_microsoft_outlook_client(config):
    return MicrosoftOutlookClient(ConnectorHTTPClient(config.transport))


def register_microsoft_outlook_connector(registry, config=None, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    config = config or create_microsoft_outlook_config()
    connector = MicrosoftOutlookConnector(
        config, client or create_microsoft_outlook_client(config)
    )
    registry.register(connector)
    return connector
