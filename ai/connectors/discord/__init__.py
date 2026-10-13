"""Discord connector public API."""

from ai.connectors.discord.client import DiscordClient
from ai.connectors.discord.config import (
    DISCORD_ALLOWED_HOSTS,
    DISCORD_API_BASE_URL,
    DiscordConnectorConfig,
)
from ai.connectors.discord.connector import DiscordConnector
from ai.connectors.discord.models import DiscordOperation
from ai.connectors.discord.schemas import (
    build_discord_metadata,
    build_discord_operations,
    validate_discord_arguments,
)
from ai.connectors.discord.tools import create_discord_client


def register_discord_connector(registry, config=None, client=None):
    config = config or DiscordConnectorConfig()
    client = client or create_discord_client(config)
    connector = DiscordConnector(config, client)
    registry.register(connector)
    return connector


__all__ = [
    "DISCORD_ALLOWED_HOSTS",
    "DISCORD_API_BASE_URL",
    "DiscordClient",
    "DiscordConnector",
    "DiscordConnectorConfig",
    "DiscordOperation",
    "build_discord_metadata",
    "build_discord_operations",
    "create_discord_client",
    "register_discord_connector",
    "validate_discord_arguments",
]
