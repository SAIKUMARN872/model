"""Dropbox connector configuration."""

from dataclasses import dataclass

from ai.connectors.config import ConnectorConfig

DROPBOX_API_BASE_URL = "https://api.dropboxapi.com"
DROPBOX_ALLOWED_HOSTS = ("api.dropboxapi.com",)


@dataclass(frozen=True, slots=True)
class DropboxConnectorConfig:
    transport: ConnectorConfig = ConnectorConfig(
        base_url=DROPBOX_API_BASE_URL,
        timeout_seconds=20.0,
        credential_env_vars={"access_token": "DROPBOX_ACCESS_TOKEN"},
        allowed_hosts=DROPBOX_ALLOWED_HOSTS,
    )
    version: str = "1.0.0"
    description: str = "Dropbox API v2 connector"
    required_permissions: tuple[str, ...] = ("dropbox:read",)

    def __post_init__(self):
        if self.transport.base_url != DROPBOX_API_BASE_URL:
            raise ValueError("Dropbox API base URL must be the official API host")
        if tuple(self.transport.allowed_hosts) != DROPBOX_ALLOWED_HOSTS:
            raise ValueError("Dropbox connector must allow only api.dropboxapi.com")
        if not self.version.strip():
            raise ValueError("version cannot be empty")
