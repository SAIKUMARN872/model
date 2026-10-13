"""Slack connector registration."""
from ai.connectors.registry import ConnectorRegistry
from .connector import SlackConnector


def register_slack_connector(registry, config=None, *, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    connector = SlackConnector(config=config, client=client)
    registry.register(connector)
    return connector


__all__ = ["register_slack_connector"]
