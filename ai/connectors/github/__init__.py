"""GitHub connector public API."""

from ai.connectors.github.client import GitHubClient
from ai.connectors.github.config import (
    GITHUB_ALLOWED_HOSTS,
    GITHUB_API_BASE_URL,
    GitHubConnectorConfig,
)
from ai.connectors.github.connector import GitHubConnector
from ai.connectors.github.models import GitHubOperation
from ai.connectors.github.schemas import (
    build_github_metadata,
    build_github_operations,
    build_github_path,
    validate_github_arguments,
)
from ai.connectors.github.tools import create_github_client


def register_github_connector(registry, config=None, client=None):
    config = config or GitHubConnectorConfig()
    client = client or create_github_client(config)
    connector = GitHubConnector(config, client)
    registry.register(connector)
    return connector


__all__ = [
    "GITHUB_ALLOWED_HOSTS",
    "GITHUB_API_BASE_URL",
    "GitHubClient",
    "GitHubConnector",
    "GitHubConnectorConfig",
    "GitHubOperation",
    "build_github_metadata",
    "build_github_operations",
    "build_github_path",
    "create_github_client",
    "register_github_connector",
    "validate_github_arguments",
]
