"""SAP connector registration."""
from ai.connectors.registry import ConnectorRegistry
from .connector import SAPConnector


def register_sap_connector(registry, config, *, client=None):
    if not isinstance(registry, ConnectorRegistry):
        raise TypeError("registry must be ConnectorRegistry")
    connector = SAPConnector(config, client=client)
    registry.register(connector)
    return connector


__all__ = ["register_sap_connector"]
