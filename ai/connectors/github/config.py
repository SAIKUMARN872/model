"""GitHub connector configuration."""

from dataclasses import dataclass

from ai.connectors.config import ConnectorConfig

GITHUB_API_BASE_URL = "https://api.github.com"
GITHUB_ALLOWED_HOSTS = ("api.github.com",)


@dataclass(frozen=True, slots=True)
class GitHubConnectorConfig:
    transport: ConnectorConfig = ConnectorConfig(
        base_url=GITHUB_API_BASE_URL,
        timeout_seconds=20.0,
        credential_env_vars={"token": "GITHUB_TOKEN"},
        allowed_hosts=GITHUB_ALLOWED_HOSTS,
    )
    version: str = "1.0.0"
    description: str = "GitHub REST API connector"
    required_permissions: tuple[str, ...] = ("github:read",)

    def __post_init__(self):
        if self.transport.base_url != GITHUB_API_BASE_URL:
            raise ValueError("GitHub API base URL must be the official API host")
        if tuple(self.transport.allowed_hosts) != GITHUB_ALLOWED_HOSTS:
            raise ValueError("GitHub connector must allow only api.github.com")
        if not self.version.strip():
            raise ValueError("version cannot be empty")
