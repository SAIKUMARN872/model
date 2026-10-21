"""Register the Workday connector."""
from ai.connectors.registry import ConnectorRegistry
from .connector import WorkdayConnector


def register_workday_connector(registry, config, *, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    connector = WorkdayConnector(config, client=client)
    registry.register(connector)
    return connector


__all__ = ["register_workday_connector"]
