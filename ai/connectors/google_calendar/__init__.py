"""Google Calendar connector public API."""

from ai.connectors.google_calendar.client import GoogleCalendarClient
from ai.connectors.google_calendar.config import (
    GOOGLE_CALENDAR_ALLOWED_HOSTS,
    GOOGLE_CALENDAR_API_BASE_URL,
    GoogleCalendarConnectorConfig,
)
from ai.connectors.google_calendar.connector import GoogleCalendarConnector
from ai.connectors.google_calendar.models import GoogleCalendarOperation
from ai.connectors.google_calendar.schemas import (
    build_google_calendar_metadata,
    build_google_calendar_operations,
    validate_google_calendar_arguments,
)
from ai.connectors.google_calendar.tools import create_google_calendar_client


def register_google_calendar_connector(registry, config=None, client=None):
    config = config or GoogleCalendarConnectorConfig()
    client = client or create_google_calendar_client(config)
    connector = GoogleCalendarConnector(config, client)
    registry.register(connector)
    return connector


__all__ = [
    "GOOGLE_CALENDAR_ALLOWED_HOSTS",
    "GOOGLE_CALENDAR_API_BASE_URL",
    "GoogleCalendarClient",
    "GoogleCalendarConnector",
    "GoogleCalendarConnectorConfig",
    "GoogleCalendarOperation",
    "build_google_calendar_metadata",
    "build_google_calendar_operations",
    "create_google_calendar_client",
    "register_google_calendar_connector",
    "validate_google_calendar_arguments",
]
