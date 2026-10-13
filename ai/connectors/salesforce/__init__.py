"""Salesforce read-only connector."""
from .client import SalesforceClient
from .config import SalesforceConfig
from .connector import SalesforceConnector
from .tools import register_salesforce_connector

__all__ = [
    "SalesforceClient",
    "SalesforceConfig",
    "SalesforceConnector",
    "register_salesforce_connector",
]
