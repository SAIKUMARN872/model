"""HubSpot CRM connector configuration."""

from dataclasses import dataclass

from ai.connectors.config import ConnectorConfig

HUBSPOT_API_BASE_URL = "https://api.hubapi.com"
HUBSPOT_ALLOWED_HOSTS = ("api.hubapi.com",)


@dataclass(frozen=True, slots=True)
class HubSpotConnectorConfig:
    transport: ConnectorConfig = ConnectorConfig(
        base_url=HUBSPOT_API_BASE_URL,
        timeout_seconds=20.0,
        credential_env_vars={"token": "HUBSPOT_ACCESS_TOKEN"},
        allowed_hosts=HUBSPOT_ALLOWED_HOSTS,
    )
    version: str = "1.0.0"
    description: str = "Read-only HubSpot CRM connector"
    required_permissions: tuple[str, ...] = ("hubspot:read",)

    def __post_init__(self):
        if self.transport.base_url != HUBSPOT_API_BASE_URL:
            raise ValueError("HubSpot API base URL must be the official API host")
        if tuple(self.transport.allowed_hosts) != HUBSPOT_ALLOWED_HOSTS:
            raise ValueError("HubSpot must allow only api.hubapi.com")
        if not isinstance(self.version, str) or not self.version.strip():
            raise ValueError("version cannot be empty")
        if not isinstance(self.required_permissions, tuple):
            raise ValueError("required_permissions must be a tuple")
