"""Configuration for the Discord API connector."""

from dataclasses import dataclass

from ai.connectors.config import ConnectorConfig

DISCORD_API_BASE_URL = "https://discord.com/api/v10"
DISCORD_ALLOWED_HOSTS = ("discord.com",)


@dataclass(frozen=True, slots=True)
class DiscordConnectorConfig:
    transport: ConnectorConfig = ConnectorConfig(
        base_url=DISCORD_API_BASE_URL,
        timeout_seconds=15.0,
        credential_env_vars={"bot_token": "DISCORD_BOT_TOKEN"},
        allowed_hosts=DISCORD_ALLOWED_HOSTS,
    )
    enable_message_sending: bool = False
    version: str = "1.0.0"
    description: str = "Discord API v10 connector"
    required_permissions: tuple[str, ...] = ("discord:read",)

    def __post_init__(self):
        if self.transport.base_url != DISCORD_API_BASE_URL:
            raise ValueError("Discord API base URL must be the official API v10 URL")
        if tuple(self.transport.allowed_hosts) != DISCORD_ALLOWED_HOSTS:
            raise ValueError("Discord connector must allow only discord.com")
        if self.enable_message_sending and "discord:messages:send" not in self.required_permissions:
            raise ValueError(
                "Enabling message sending requires discord:messages:send permission"
            )
        if not self.version.strip():
            raise ValueError("version cannot be empty")
