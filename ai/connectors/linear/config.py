"""Linear connector configuration."""

from dataclasses import dataclass
from urllib.parse import urlsplit

from ai.connectors.config import ConnectorConfig

LINEAR_API_URL = "https://api.linear.app/graphql"


@dataclass(frozen=True, slots=True)
class LinearConnectorConfig:
    transport: ConnectorConfig
    version: str = "1.0.0"
    description: str = "Read-only Linear GraphQL connector"
    required_permissions: tuple[str, ...] = ("linear:read",)

    def __post_init__(self):
        parsed = urlsplit(self.transport.base_url or "")
        if (
            parsed.scheme != "https"
            or parsed.hostname != "api.linear.app"
            or parsed.path not in ("", "/")
            or parsed.username
            or parsed.password
            or parsed.query
            or parsed.fragment
        ):
            raise ValueError("Linear endpoint must use https://api.linear.app")
        if tuple(self.transport.allowed_hosts) != ("api.linear.app",):
            raise ValueError("Linear must allow only api.linear.app")
        if not self.version.strip():
            raise ValueError("version cannot be empty")


def create_linear_config(
    *,
    timeout_seconds=20.0,
    credential_env_var="LINEAR_API_KEY",
):
    transport = ConnectorConfig(
        base_url="https://api.linear.app",
        timeout_seconds=timeout_seconds,
        credential_env_vars={"token": credential_env_var},
        allowed_hosts=("api.linear.app",),
    )
    return LinearConnectorConfig(transport=transport)
