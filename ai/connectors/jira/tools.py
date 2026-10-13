"""Jira connector registration helpers."""

from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.registry import ConnectorRegistry
from ai.connectors.jira.client import JiraClient
from ai.connectors.jira.config import JiraConnectorConfig, create_jira_config
from ai.connectors.jira.connector import JiraConnector


def create_jira_client(config):
    return JiraClient(ConnectorHTTPClient(config.transport))


def register_jira_connector(registry, config, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    connector = JiraConnector(config, client or create_jira_client(config))
    registry.register(connector)
    return connector


__all__ = [
    "JiraClient",
    "JiraConnector",
    "JiraConnectorConfig",
    "create_jira_client",
    "create_jira_config",
    "register_jira_connector",
]
