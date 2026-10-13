"""Google Calendar connector configuration."""

from dataclasses import dataclass

from ai.connectors.config import ConnectorConfig

GOOGLE_CALENDAR_API_BASE_URL = "https://www.googleapis.com/calendar/v3"
GOOGLE_CALENDAR_ALLOWED_HOSTS = ("www.googleapis.com",)


@dataclass(frozen=True, slots=True)
class GoogleCalendarConnectorConfig:
    transport: ConnectorConfig = ConnectorConfig(
        base_url=GOOGLE_CALENDAR_API_BASE_URL,
        timeout_seconds=20.0,
        credential_env_vars={"access_token": "GOOGLE_CALENDAR_ACCESS_TOKEN"},
        allowed_hosts=GOOGLE_CALENDAR_ALLOWED_HOSTS,
    )
    version: str = "1.0.0"
    description: str = "Read-only Google Calendar API v3 connector"
    required_permissions: tuple[str, ...] = ("google_calendar:read",)

    def __post_init__(self):
        if self.transport.base_url != GOOGLE_CALENDAR_API_BASE_URL:
            raise ValueError("Google Calendar API base URL must be the official endpoint")
        if tuple(self.transport.allowed_hosts) != GOOGLE_CALENDAR_ALLOWED_HOSTS:
            raise ValueError("Google Calendar connector must allow only www.googleapis.com")
        if not self.version.strip():
            raise ValueError("version cannot be empty")
