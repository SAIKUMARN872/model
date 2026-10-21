"""Read-only SAP OData connector."""
from .client import SAPClient
from .config import SAPConfig, SAPEntityConfig
from .connector import SAPConnector
from .tools import register_sap_connector

__all__ = [
    "SAPClient", "SAPConfig", "SAPEntityConfig",
    "SAPConnector", "register_sap_connector",
]
