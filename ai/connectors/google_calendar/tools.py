"""Google Calendar client factory."""

from ai.connectors.client import ConnectorHTTPClient
from ai.connectors.google_calendar.client import GoogleCalendarClient
from ai.connectors.google_calendar.config import GoogleCalendarConnectorConfig


def create_google_calendar_client(config=None):
    config = config or GoogleCalendarConnectorConfig()
    return GoogleCalendarClient(ConnectorHTTPClient(config.transport))
