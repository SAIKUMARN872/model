"""ServiceNow connector registration."""
from ai.connectors.registry import ConnectorRegistry
from .connector import ServiceNowConnector


def register_servicenow_connector(registry, config, *, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    connector = ServiceNowConnector(config, client=client)
    registry.register(connector)
    return connector


__all__ = ["register_servicenow_connector"]
