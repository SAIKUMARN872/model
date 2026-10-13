"""Microsoft Outlook operation schemas and input validation."""

import re

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from ai.connectors.microsoft_outlook.models import OutlookOperation


def _schema(properties=None, required=None):
    return {
        "type": "object",
        "properties": properties or {},
        "required": required or [],
        "additionalProperties": False,
    }


def _page_properties():
    return {
        "top": {"type": "integer", "minimum": 1, "maximum": 100},
    }


def build_outlook_operations():
    message_id = {"type": "string", "minLength": 1, "maxLength": 500}
    return (
        OutlookOperation(
            name="list_messages",
            method="GET",
            path="/v1.0/me/messages",
            description="List recent Outlook messages.",
            schema=_schema({
                **_page_properties(),
                "skip": {"type": "integer", "minimum": 0, "maximum": 10000},
                "search": {"type": "string", "maxLength": 200},
            }),
            permission="microsoft_outlook:mail:read",
        ),
        OutlookOperation(
            name="search_messages",
            method="GET",
            path="/v1.0/me/messages",
            description="Search Outlook messages using Microsoft Graph search syntax.",
            schema=_schema({
                "search": {"type": "string", "minLength": 1, "maxLength": 200},
                **_page_properties(),
            }, ["search"]),
            permission="microsoft_outlook:mail:read",
        ),
        OutlookOperation(
            name="get_message",
            method="GET",
            path="/v1.0/me/messages/{message_id}",
            description="Retrieve an Outlook message by ID.",
            schema=_schema({
                "message_id": message_id,
            }, ["message_id"]),
            permission="microsoft_outlook:mail:read",
        ),
        OutlookOperation(
            name="list_calendar_events",
            method="GET",
            path="/v1.0/me/events",
            description="List calendar events.",
            schema=_schema({
                **_page_properties(),
                "skip": {"type": "integer", "minimum": 0, "maximum": 10000},
                "start_datetime": {"type": "string", "maxLength": 40},
                "end_datetime": {"type": "string", "maxLength": 40},
            }),
            permission="microsoft_outlook:calendar:read",
        ),
    )


def build_outlook_metadata(config):
    operations = build_outlook_operations()
    return ConnectorMetadata(
        name="microsoft_outlook",
        version=config.version,
        description=config.description,
        operations=tuple(op.name for op in operations),
        operation_schemas={op.name: op.schema for op in operations},
        required_permissions=config.required_permissions,
    )


def validate_outlook_arguments(metadata, operation, arguments):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")
    if operation not in metadata.operation_schemas:
        raise ConnectorValidationError("Unsupported Outlook operation")

    schema = metadata.operation_schemas[operation]
    properties = schema.get("properties", {})
    unknown = set(arguments) - set(properties)
    if unknown:
        raise ConnectorValidationError("Unknown Outlook argument")
    for name in schema.get("required", []):
        if name not in arguments:
            raise ConnectorValidationError(f"Missing required argument: {name}")

    result = dict(arguments)

    for name in ("top", "skip"):
        if name in result:
            value = result[name]
            minimum, maximum = (1, 100) if name == "top" else (0, 10000)
            if (
                isinstance(value, bool)
                or not isinstance(value, int)
                or not minimum <= value <= maximum
            ):
                raise ConnectorValidationError(f"{name} is outside the allowed range")

    for name in ("search", "message_id", "start_datetime", "end_datetime"):
        if name in result:
            value = result[name]
            maximum = properties[name].get("maxLength", 500)
            if (
                not isinstance(value, str)
                or len(value) > maximum
                or (name in ("search", "message_id") and not value.strip())
                or any(ord(ch) < 32 for ch in value)
            ):
                raise ConnectorValidationError(f"{name} is invalid")

    for name in ("start_datetime", "end_datetime"):
        if name in result and not re.match(
            r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}", result[name]
        ):
            raise ConnectorValidationError(f"{name} must be an ISO datetime")

    if "start_datetime" in result and "end_datetime" in result:
        if result["start_datetime"] >= result["end_datetime"]:
            raise ConnectorValidationError("start_datetime must precede end_datetime")

    return result


def build_outlook_query(operation, arguments):
    query = {}
    if "top" in arguments:
        query["$top"] = arguments["top"]
    if "skip" in arguments:
        query["$skip"] = arguments["skip"]

    if operation == "list_messages":
        query["$select"] = "id,subject,from,receivedDateTime,isRead,webLink"
        if "search" in arguments:
            query["$search"] = f'"{arguments["search"]}"'
    elif operation == "search_messages":
        query["$search"] = f'"{arguments["search"]}"'
        query["$select"] = "id,subject,from,receivedDateTime,isRead,webLink"
    elif operation == "get_message":
        query["$select"] = "id,subject,bodyPreview,from,toRecipients,receivedDateTime,isRead,webLink"
    elif operation == "list_calendar_events":
        query["$select"] = "id,subject,start,end,location,organizer,webLink"
        if "start_datetime" in arguments:
            query["$filter"] = (
                f"start/dateTime ge '{arguments['start_datetime']}'"
            )
        if "end_datetime" in arguments:
            end_filter = f"end/dateTime le '{arguments['end_datetime']}'"
            query["$filter"] = (
                query["$filter"] + " and " + end_filter
                if "$filter" in query else end_filter
            )
            query["$orderby"] = "start/dateTime"
    return query
