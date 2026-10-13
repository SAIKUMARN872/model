"""GitLab connector public API."""

from ai.connectors.gitlab.client import GitLabClient
from ai.connectors.gitlab.config import (
    GITLAB_ALLOWED_HOSTS,
    GITLAB_API_BASE_URL,
    GitLabConnectorConfig,
)
from ai.connectors.gitlab.connector import GitLabConnector
from ai.connectors.gitlab.models import GitLabOperation
from ai.connectors.gitlab.schemas import (
    build_gitlab_metadata,
    build_gitlab_operations,
    validate_gitlab_arguments,
)
from ai.connectors.gitlab.tools import create_gitlab_client


def register_gitlab_connector(registry, config=None, client=None):
    config = config or GitLabConnectorConfig()
    client = client or create_gitlab_client(config)
    connector = GitLabConnector(config, client)
    registry.register(connector)
    return connector


__all__ = [
    "GITLAB_ALLOWED_HOSTS",
    "GITLAB_API_BASE_URL",
    "GitLabClient",
    "GitLabConnector",
    "GitLabConnectorConfig",
    "GitLabOperation",
    "build_gitlab_metadata",
    "build_gitlab_operations",
    "create_gitlab_client",
    "register_gitlab_connector",
    "validate_gitlab_arguments",
]
