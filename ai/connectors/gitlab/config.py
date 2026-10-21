"""GitLab connector configuration."""

from dataclasses import dataclass

from ai.connectors.config import ConnectorConfig

GITLAB_API_BASE_URL = "https://gitlab.com/api/v4"
GITLAB_ALLOWED_HOSTS = ("gitlab.com",)


@dataclass(frozen=True, slots=True)
class GitLabConnectorConfig:
    transport: ConnectorConfig = ConnectorConfig(
        base_url=GITLAB_API_BASE_URL,
        timeout_seconds=20.0,
        credential_env_vars={"token": "GITLAB_TOKEN"},
        allowed_hosts=GITLAB_ALLOWED_HOSTS,
    )
    version: str = "1.0.0"
    description: str = "GitLab REST API v4 connector"
    required_permissions: tuple[str, ...] = ("gitlab:read",)

    def __post_init__(self):
        if self.transport.base_url != GITLAB_API_BASE_URL:
            raise ValueError("GitLab API base URL must be the configured official API URL")
        if tuple(self.transport.allowed_hosts) != GITLAB_ALLOWED_HOSTS:
            raise ValueError("GitLab connector must allow only gitlab.com")
        if not self.version.strip():
            raise ValueError("version cannot be empty")
