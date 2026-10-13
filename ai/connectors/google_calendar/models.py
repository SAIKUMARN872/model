"""Google Calendar operation metadata."""

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class GoogleCalendarOperation:
    name: str
    path_template: str
    description: str
    schema: dict
