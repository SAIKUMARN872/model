"""Discord connector metadata and argument validation."""

import re

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from ai.connectors.schemas import validate_connector_arguments
from ai.connectors.discord.models import DiscordOperation

_SNOWFLAKE = re.compile(r"^[0-9]{1,25}$")


def snowflake(value, field_name):
    if not isinstance(value, (str, int)) or isinstance(value, bool):
        raise ConnectorValidationError(f"{field_name} must be a Discord ID")
    result = str(value)
    if not _SNOWFLAKE.fullmatch(result):
        raise ConnectorValidationError(f"{field_name} must be a numeric Discord ID")
    return result


def _object_schema(properties=None, required=None):
    return {
        "type": "object",
        "properties": properties or {},
        "required": required or [],
        "additionalProperties": False,
    }


def build_discord_operations(enable_message_sending=False):
    operations = [
        DiscordOperation(
            name="get_current_bot",
            method="GET",
            path_template="/users/@me",
            description="Get the authenticated bot account.",
            schema=_object_schema(),
        ),
        DiscordOperation(
            name="list_guilds",
            method="GET",
            path_template="/users/@me/guilds",
            description="List guilds visible to the authenticated bot.",
            schema=_object_schema({
                "limit": {"type": "integer", "minimum": 1, "maximum": 200}
            }),
        ),
        DiscordOperation(
            name="get_guild",
            method="GET",
            path_template="/guilds/{guild_id}",
            description="Get a guild by Discord ID.",
            schema=_object_schema({
                "guild_id": {"type": "string", "minLength": 1}
            }, ["guild_id"]),
        ),
        DiscordOperation(
            name="list_guild_channels",
            method="GET",
            path_template="/guilds/{guild_id}/channels",
            description="List channels in a guild.",
            schema=_object_schema({
                "guild_id": {"type": "string", "minLength": 1}
            }, ["guild_id"]),
        ),
        DiscordOperation(
            name="get_channel",
            method="GET",
            path_template="/channels/{channel_id}",
            description="Get a channel by Discord ID.",
            schema=_object_schema({
                "channel_id": {"type": "string", "minLength": 1}
            }, ["channel_id"]),
        ),
    ]
    if enable_message_sending:
        operations.append(
            DiscordOperation(
                name="send_message",
                method="POST",
                path_template="/channels/{channel_id}/messages",
                description="Send a text message to a channel.",
                schema=_object_schema({
                    "channel_id": {"type": "string", "minLength": 1},
                    "content": {"type": "string", "minLength": 1, "maxLength": 2000},
                }, ["channel_id", "content"]),
            )
        )
    return tuple(operations)


def build_discord_metadata(config):
    operations = build_discord_operations(config.enable_message_sending)
    permissions = set(config.required_permissions)
    if config.enable_message_sending:
        permissions.add("discord:messages:send")
    return ConnectorMetadata(
        name="discord",
        version=config.version,
        description=config.description,
        operations=tuple(operation.name for operation in operations),
        operation_schemas={
            operation.name: operation.schema for operation in operations
        },
        required_permissions=tuple(sorted(permissions)),
    )


def validate_discord_arguments(metadata, operation, arguments):
    validate_connector_arguments(metadata, operation, arguments)
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")
    result = dict(arguments)
    if "guild_id" in result:
        result["guild_id"] = snowflake(result["guild_id"], "guild_id")
    if "channel_id" in result:
        result["channel_id"] = snowflake(result["channel_id"], "channel_id")
    if "limit" in result:
        limit = result["limit"]
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 200:
            raise ConnectorValidationError("limit must be an integer from 1 to 200")
    if "content" in result:
        content = result["content"]
        if not isinstance(content, str) or not content.strip() or len(content) > 2000:
            raise ConnectorValidationError("content must contain 1 to 2000 characters")
    return result
