"""Microsoft Teams schemas and input validation."""

import re
from urllib.parse import quote

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from ai.connectors.microsoft_teams.models import TeamsOperation


_ID_PATTERN = re.compile(r"^[A-Za-z0-9._:@-]{1,200}$")


def _schema(properties=None, required=None):
    return {
        "type": "object",
        "properties": properties or {},
        "required": required or [],
        "additionalProperties": False,
    }


def _id_schema():
    return {"type": "string", "minLength": 1, "maxLength": 200}


def build_teams_operations():
    return (
        TeamsOperation(
            name="list_joined_teams",
            method="GET",
            path="/v1.0/me/joinedTeams",
            description="List teams joined by the current user.",
            schema=_schema({
                "top": {"type": "integer", "minimum": 1, "maximum": 100},
            }),
        ),
        TeamsOperation(
            name="list_channels",
            method="GET",
            path="/v1.0/teams/{team_id}/channels",
            description="List channels in a team.",
            schema=_schema({
                "team_id": _id_schema(),
                "top": {"type": "integer", "minimum": 1, "maximum": 100},
            }, ["team_id"]),
        ),
        TeamsOperation(
            name="get_channel",
            method="GET",
            path="/v1.0/teams/{team_id}/channels/{channel_id}",
            description="Retrieve a channel by ID.",
            schema=_schema({
                "team_id": _id_schema(),
                "channel_id": _id_schema(),
            }, ["team_id", "channel_id"]),
        ),
        TeamsOperation(
            name="list_channel_messages",
            method="GET",
            path="/v1.0/teams/{team_id}/channels/{channel_id}/messages",
            description="List messages in a channel.",
            schema=_schema({
                "team_id": _id_schema(),
                "channel_id": _id_schema(),
                "top": {"type": "integer", "minimum": 1, "maximum": 50},
            }, ["team_id", "channel_id"]),
        ),
    )


def build_teams_metadata(config):
    operations = build_teams_operations()
    return ConnectorMetadata(
        name="microsoft_teams",
        version=config.version,
        description=config.description,
        operations=tuple(op.name for op in operations),
        operation_schemas={op.name: op.schema for op in operations},
        required_permissions=config.required_permissions,
    )


def validate_teams_arguments(metadata, operation, arguments):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")
    if operation not in metadata.operation_schemas:
        raise ConnectorValidationError("Unsupported Teams operation")

    schema = metadata.operation_schemas[operation]
    properties = schema.get("properties", {})
    if set(arguments) - set(properties):
        raise ConnectorValidationError("Unknown Teams argument")

    for name in schema.get("required", []):
        if name not in arguments:
            raise ConnectorValidationError(f"Missing required argument: {name}")

    result = dict(arguments)
    for name in ("team_id", "channel_id"):
        if name in result:
            value = result[name]
            if not isinstance(value, str) or not _ID_PATTERN.fullmatch(value):
                raise ConnectorValidationError(f"{name} is invalid")

    if "top" in result:
        value = result["top"]
        maximum = 50 if operation == "list_channel_messages" else 100
        if (
            isinstance(value, bool)
            or not isinstance(value, int)
            or not 1 <= value <= maximum
        ):
            raise ConnectorValidationError(f"top must be from 1 to {maximum}")

    return result


def build_teams_path(operation, arguments):
    path = operation.path
    for name in ("team_id", "channel_id"):
        marker = "{" + name + "}"
        if marker in path:
            path = path.replace(marker, quote(arguments[name], safe=""))
    return path
