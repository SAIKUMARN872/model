"""Jira Cloud connector configuration."""

from dataclasses import dataclass
from urllib.parse import urlsplit

from ai.connectors.config import ConnectorConfig


@dataclass(frozen=True, slots=True)
class JiraConnectorConfig:
    transport: ConnectorConfig
    version: str = "1.0.0"
    description: str = "Read-only Jira Cloud REST API connector"
    required_permissions: tuple[str, ...] = ("jira:read",)

    def __post_init__(self):
        parsed = urlsplit(self.transport.base_url or "")
        host = parsed.hostname or ""
        if (
            parsed.scheme != "https"
            or not host.endswith(".atlassian.net")
            or host == "atlassian.net"
            or parsed.username
            or parsed.password
            or parsed.query
            or parsed.fragment
            or parsed.path not in ("", "/")
        ):
            raise ValueError("Jira base URL must be an HTTPS Jira Cloud tenant")
        if tuple(self.transport.allowed_hosts) != (host,):
            raise ValueError("Jira must allow only its configured tenant host")
        if not self.version.strip():
            raise ValueError("version cannot be empty")
        if not isinstance(self.required_permissions, tuple):
            raise ValueError("required_permissions must be a tuple")


def create_jira_config(
    site_url,
    *,
    timeout_seconds=20.0,
    credential_env_var="JIRA_API_TOKEN",
):
    parsed = urlsplit(site_url if isinstance(site_url, str) else "")
    host = parsed.hostname or ""
    if (
        parsed.scheme != "https"
        or not host.endswith(".atlassian.net")
        or host == "atlassian.net"
        or parsed.username
        or parsed.password
        or parsed.path not in ("", "/")
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError("Provide an HTTPS Jira Cloud tenant URL")

    transport = ConnectorConfig(
        base_url=f"https://{host}",
        timeout_seconds=timeout_seconds,
        credential_env_vars={"token": credential_env_var},
        allowed_hosts=(host,),
    )
    return JiraConnectorConfig(transport=transport)
