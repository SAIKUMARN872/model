"""Gmail operation schemas and argument validation."""

import re

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from ai.connectors.schemas import validate_connector_arguments
from ai.connectors.gmail.models import GmailOperation

_MESSAGE_ID = re.compile(r"^[A-Za-z0-9_-]{1,200}$")


def _object_schema(properties=None, required=None):
    return {
        "type": "object",
        "properties": properties or {},
        "required": required or [],
        "additionalProperties": False,
    }


def build_gmail_operations():
    return (
        GmailOperation(
            name="get_profile",
            path_template="/profile",
            description="Get the authenticated Gmail mailbox profile.",
            schema=_object_schema(),
        ),
        GmailOperation(
            name="list_labels",
            path_template="/labels",
            description="List labels in the authenticated mailbox.",
            schema=_object_schema(),
        ),
        GmailOperation(
            name="list_messages",
            path_template="/messages",
            description="List message IDs and thread IDs in the mailbox.",
            schema=_object_schema({
                "maxResults": {
                    "type": "integer", "minimum": 1, "maximum": 100
                },
                "pageToken": {"type": "string", "minLength": 1},
                "q": {"type": "string", "maxLength": 500},
                "includeSpamTrash": {"type": "boolean"},
            }),
        ),
        GmailOperation(
            name="get_message",
            path_template="/messages/{message_id}",
            description="Get a message by its Gmail message ID.",
            schema=_object_schema({
                "message_id": {"type": "string", "minLength": 1},
                "format": {
                    "type": "string",
                    "enum": ["minimal", "metadata", "full"],
                },
            }, ["message_id"]),
        ),
    )


def build_gmail_metadata(config):
    operations = build_gmail_operations()
    return ConnectorMetadata(
        name="gmail",
        version=config.version,
        description=config.description,
        operations=tuple(item.name for item in operations),
        operation_schemas={item.name: item.schema for item in operations},
        required_permissions=config.required_permissions,
    )


def validate_gmail_arguments(metadata, operation, arguments):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")

    validate_connector_arguments(metadata, operation, arguments)
    result = dict(arguments)

    if "maxResults" in result:
        value = result["maxResults"]
        if isinstance(value, bool) or not isinstance(value, int) or not 1 <= value <= 100:
            raise ConnectorValidationError("maxResults must be an integer from 1 to 100")

    if "includeSpamTrash" in result and not isinstance(result["includeSpamTrash"], bool):
        raise ConnectorValidationError("includeSpamTrash must be a boolean")

    if "q" in result and len(result["q"]) > 500:
        raise ConnectorValidationError("q cannot exceed 500 characters")

    if "pageToken" in result:
        value = result["pageToken"]
        if not isinstance(value, str) or not value.strip():
            raise ConnectorValidationError("pageToken must be a non-empty string")

    if "message_id" in result:
        value = result["message_id"]
        if not isinstance(value, str) or not _MESSAGE_ID.fullmatch(value):
            raise ConnectorValidationError("message_id has an invalid format")

    return result
