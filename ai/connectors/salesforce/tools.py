"""Salesforce connector registration."""
from ai.connectors.registry import ConnectorRegistry
from .connector import SalesforceConnector


def register_salesforce_connector(registry, config, *, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    connector = SalesforceConnector(config, client=client)
    registry.register(connector)
    return connector


__all__ = ["register_salesforce_connector"]
