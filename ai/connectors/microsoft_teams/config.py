"""Microsoft Teams connector configuration."""

from dataclasses import dataclass
from urllib.parse import urlsplit

from ai.connectors.config import ConnectorConfig


@dataclass(frozen=True, slots=True)
class MicrosoftTeamsConfig:
    transport: ConnectorConfig
    version: str = "1.0.0"
    description: str = "Read-only Microsoft Teams Graph connector"
    required_permissions: tuple[str, ...] = ("microsoft_teams:read",)

    def __post_init__(self):
        parsed = urlsplit(self.transport.base_url or "")
        if (
            parsed.scheme != "https"
            or parsed.hostname != "graph.microsoft.com"
            or parsed.path not in ("", "/")
            or parsed.username
            or parsed.password
            or parsed.query
            or parsed.fragment
        ):
            raise ValueError("Teams endpoint must use HTTPS Microsoft Graph")
        if tuple(self.transport.allowed_hosts) != ("graph.microsoft.com",):
            raise ValueError("Only graph.microsoft.com may be allowed")
        if not self.version.strip():
            raise ValueError("version cannot be empty")


def create_microsoft_teams_config(
    *,
    timeout_seconds=20.0,
    credential_env_var="MICROSOFT_GRAPH_ACCESS_TOKEN",
):
    transport = ConnectorConfig(
        base_url="https://graph.microsoft.com",
        timeout_seconds=timeout_seconds,
        credential_env_vars={"token": credential_env_var},
        allowed_hosts=("graph.microsoft.com",),
    )
    return MicrosoftTeamsConfig(transport=transport)
