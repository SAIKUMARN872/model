"""Gmail connector configuration."""

from dataclasses import dataclass

from ai.connectors.config import ConnectorConfig

GMAIL_API_BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me"
GMAIL_ALLOWED_HOSTS = ("gmail.googleapis.com",)


@dataclass(frozen=True, slots=True)
class GmailConnectorConfig:
    transport: ConnectorConfig = ConnectorConfig(
        base_url=GMAIL_API_BASE_URL,
        timeout_seconds=20.0,
        credential_env_vars={"access_token": "GMAIL_ACCESS_TOKEN"},
        allowed_hosts=GMAIL_ALLOWED_HOSTS,
    )
    version: str = "1.0.0"
    description: str = "Read-only Gmail API v1 connector"
    required_permissions: tuple[str, ...] = ("gmail:read",)

    def __post_init__(self):
        if self.transport.base_url != GMAIL_API_BASE_URL:
            raise ValueError("Gmail API base URL must be the official configured endpoint")
        if tuple(self.transport.allowed_hosts) != GMAIL_ALLOWED_HOSTS:
            raise ValueError("Gmail connector must allow only gmail.googleapis.com")
        if not self.version.strip():
            raise ValueError("version cannot be empty")
