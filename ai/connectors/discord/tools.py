"""Discord connector factory and shared transport adapter."""

from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.discord.client import DiscordClient
from ai.connectors.discord.config import DiscordConnectorConfig


def create_discord_client(config=None):
    config = config or DiscordConnectorConfig()
    return DiscordClient(ConnectorHTTPClient(config.transport))
