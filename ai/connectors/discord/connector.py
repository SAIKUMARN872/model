"""Discord connector implementation."""

from urllib.parse import quote

from ai.connectors.connector import Connector
from ai.connectors.exceptions import (
    ConnectorAuthenticationError,
    ConnectorError,
    ConnectorOperationError,
    ConnectorValidationError,
)
from ai.connectors.models import ConnectorResult
from ai.connectors.discord.schemas import (
    build_discord_metadata,
    build_discord_operations,
    validate_discord_arguments,
)


class DiscordConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        self._operations = {
            operation.name: operation
            for operation in build_discord_operations(config.enable_message_sending)
        }
        super().__init__(build_discord_metadata(config))

    async def execute(self, request, credentials):
        operation_name = request.operation
        try:
            self.validate_operation(operation_name)
            operation = self._operations[operation_name]
            arguments = validate_discord_arguments(
                self.metadata, operation_name, dict(request.arguments or {})
            )
            token = credentials.get("bot_token")
            if not isinstance(token, str) or not token.strip():
                raise ConnectorAuthenticationError(
                    "Discord bot token is not configured"
                )

            path = operation.path_template
            for key in ("guild_id", "channel_id"):
                if "{" + key + "}" in path:
                    path = path.replace(
                        "{" + key + "}", quote(arguments[key], safe="")
                    )

            query = {}
            body = None
            if operation_name == "list_guilds" and "limit" in arguments:
                query["limit"] = arguments["limit"]
            if operation_name == "send_message":
                body = {"content": arguments["content"]}

            data = self.client.request(
                operation.method,
                path,
                query=query or None,
                json_body=body,
                token=token,
            )
            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation_name,
                success=True,
                data=data,
            )
        except (ConnectorError, ConnectorValidationError) as exc:
            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation_name,
                success=False,
                error=str(exc),
            )
        except Exception:
            # Do not expose request headers, credentials, or transport internals.
            return ConnectorResult(
                connector=self.metadata.name,
                operation=operation_name,
                success=False,
                error="Discord request failed",
            )
