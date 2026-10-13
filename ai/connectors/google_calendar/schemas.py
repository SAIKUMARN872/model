"""Google Calendar operation schemas and validation."""

import re
from datetime import datetime

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from ai.connectors.schemas import validate_connector_arguments
from ai.connectors.google_calendar.models import GoogleCalendarOperation

_CALENDAR_ID = re.compile(r"^[A-Za-z0-9_.@+-]{1,255}$")
_EVENT_ID = re.compile(r"^[A-Za-z0-9_-]{1,255}$")


def _object_schema(properties=None, required=None):
    return {
        "type": "object",
        "properties": properties or {},
        "required": required or [],
        "additionalProperties": False,
    }


def build_google_calendar_operations():
    return (
        GoogleCalendarOperation(
            name="list_calendars",
            path_template="/users/me/calendarList",
            description="List calendars available to the authenticated user.",
            schema=_object_schema({
                "maxResults": {"type": "integer", "minimum": 1, "maximum": 250},
                "pageToken": {"type": "string", "minLength": 1},
                "showHidden": {"type": "boolean"},
            }),
        ),
        GoogleCalendarOperation(
            name="list_events",
            path_template="/calendars/{calendar_id}/events",
            description="List events in a calendar.",
            schema=_object_schema({
                "calendar_id": {"type": "string", "minLength": 1},
                "maxResults": {"type": "integer", "minimum": 1, "maximum": 2500},
                "pageToken": {"type": "string", "minLength": 1},
                "timeMin": {"type": "string", "minLength": 1},
                "timeMax": {"type": "string", "minLength": 1},
                "singleEvents": {"type": "boolean"},
                "orderBy": {"type": "string", "enum": ["startTime", "updated"]},
            }),
        ),
        GoogleCalendarOperation(
            name="get_event",
            path_template="/calendars/{calendar_id}/events/{event_id}",
            description="Retrieve one event by calendar ID and event ID.",
            schema=_object_schema({
                "calendar_id": {"type": "string", "minLength": 1},
                "event_id": {"type": "string", "minLength": 1},
            }, ["calendar_id", "event_id"]),
        ),
    )


def build_google_calendar_metadata(config):
    operations = build_google_calendar_operations()
    return ConnectorMetadata(
        name="google_calendar",
        version=config.version,
        description=config.description,
        operations=tuple(item.name for item in operations),
        operation_schemas={item.name: item.schema for item in operations},
        required_permissions=config.required_permissions,
    )


def _validate_rfc3339(value, field):
    if not isinstance(value, str) or not value.strip():
        raise ConnectorValidationError(f"{field} must be a non-empty RFC3339 timestamp")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ConnectorValidationError(f"{field} must be a valid RFC3339 timestamp") from exc
    if parsed.tzinfo is None:
        raise ConnectorValidationError(f"{field} must include a timezone")


def validate_google_calendar_arguments(metadata, operation, arguments):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")

    validate_connector_arguments(metadata, operation, arguments)
    result = dict(arguments)

    if "calendar_id" in result:
        value = result["calendar_id"]
        if not isinstance(value, str) or not _CALENDAR_ID.fullmatch(value):
            raise ConnectorValidationError("calendar_id has an invalid format")

    if "event_id" in result:
        value = result["event_id"]
        if not isinstance(value, str) or not _EVENT_ID.fullmatch(value):
            raise ConnectorValidationError("event_id has an invalid format")

    max_limit = 250 if operation == "list_calendars" else 2500
    if "maxResults" in result:
        value = result["maxResults"]
        if isinstance(value, bool) or not isinstance(value, int) or not 1 <= value <= max_limit:
            raise ConnectorValidationError(f"maxResults must be an integer from 1 to {max_limit}")

    for key in ("showHidden", "singleEvents"):
        if key in result and not isinstance(result[key], bool):
            raise ConnectorValidationError(f"{key} must be a boolean")

    for key in ("timeMin", "timeMax"):
        if key in result:
            _validate_rfc3339(result[key], key)

    if "timeMin" in result and "timeMax" in result:
        start = datetime.fromisoformat(result["timeMin"].replace("Z", "+00:00"))
        end = datetime.fromisoformat(result["timeMax"].replace("Z", "+00:00"))
        if start >= end:
            raise ConnectorValidationError("timeMin must be earlier than timeMax")

    if "pageToken" in result:
        value = result["pageToken"]
        if not isinstance(value, str) or not value.strip():
            raise ConnectorValidationError("pageToken must be a non-empty string")

    return result
