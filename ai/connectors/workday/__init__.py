"""Configurable, read-only Workday connector."""
from .client import WorkdayClient
from .config import WorkdayConfig, WorkdayOperationConfig
from .connector import WorkdayConnector
from .tools import register_workday_connector

__all__ = [
    "WorkdayClient",
    "WorkdayConfig",
    "WorkdayOperationConfig",
    "WorkdayConnector",
    "register_workday_connector",
]
