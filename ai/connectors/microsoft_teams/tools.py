"""Microsoft Teams connector registration helpers."""

from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.microsoft_teams.client import MicrosoftTeamsClient
from ai.connectors.microsoft_teams.config import (
    MicrosoftTeamsConfig,
    create_microsoft_teams_config,
)
from ai.connectors.microsoft_teams.connector import MicrosoftTeamsConnector


def create_microsoft_teams_client(config):
    return MicrosoftTeamsClient(ConnectorHTTPClient(config.transport))


def register_microsoft_teams_connector(registry, config=None, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    config = config or create_microsoft_teams_config()
    connector = MicrosoftTeamsConnector(
        config, client or create_microsoft_teams_client(config)
    )
    registry.register(connector)
    return connector
