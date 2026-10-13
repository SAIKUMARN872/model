"""Read-only Slack Web API connector."""
from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorMetadata, ConnectorResult
from .client import SlackClient
from .schemas import validate_slack_arguments


class SlackConnector(Connector):
    def __init__(self, config=None, client=None):
        self.config = config or __import__(
            "ai.connectors.slack.config", fromlist=["SlackConfig"]
        ).SlackConfig()
        self.client = client or SlackClient(self.config)
        schemas = {
            "get_workspace_info": {
                "type": "object", "properties": {}, "additionalProperties": False,
            },
            "list_channels": {
                "type": "object",
                "properties": {
                    "limit": {"type": "integer", "minimum": 1, "maximum": self.config.max_page_size},
                    "cursor": {"type": "string", "maxLength": 2000},
                    "types": {"type": "string", "maxLength": 100},
                },
                "additionalProperties": False,
            },
            "get_channel_history": {
                "type": "object",
                "properties": {
                    "channel": {"type": "string"},
                    "limit": {"type": "integer", "minimum": 1, "maximum": self.config.max_page_size},
                    "cursor": {"type": "string", "maxLength": 2000},
                    "oldest": {"type": "string", "maxLength": 30},
                    "latest": {"type": "string", "maxLength": 30},
                },
                "required": ["channel"],
                "additionalProperties": False,
            },
            "search_messages": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "minLength": 1, "maxLength": 500},
                    "count": {"type": "integer", "minimum": 1, "maximum": self.config.max_page_size},
                    "page": {"type": "integer", "minimum": 1, "maximum": 100},
                    "sort": {"type": "string", "maxLength": 30},
                    "sort_dir": {"type": "string", "maxLength": 4},
                },
                "required": ["query"],
                "additionalProperties": False,
            },
        }
        super().__init__(ConnectorMetadata(
            name="slack",
            version="1.0.0",
            description="Read workspace metadata, channels and messages from Slack.",
            operations=tuple(schemas),
            operation_schemas=schemas,
            required_permissions=self.config.required_permissions,
        ))

    async def execute(self, request, credentials):
        operation = request.operation
        try:
            args = validate_slack_arguments(
                operation, request.arguments or {}, self.config
            )
            token = credentials.get("access_token")
            if not token:
                from ai.connectors.exceptions import ConnectorAuthenticationError
                raise ConnectorAuthenticationError("Slack access token is missing.")

            if operation == "get_workspace_info":
                method, query = "team.info", {}
            elif operation == "list_channels":
                method = "conversations.list"
                query = {
                    "limit": args.get("limit", min(50, self.config.max_page_size)),
                    "exclude_archived": "true",
                }
                if args.get("cursor"):
                    query["cursor"] = args["cursor"]
                if args.get("types"):
                    query["types"] = args["types"]
            elif operation == "get_channel_history":
                method = "conversations.history"
                query = {
                    "channel": args["channel"],
                    "limit": args.get("limit", min(50, self.config.max_page_size)),
                }
                for key in ("cursor", "oldest", "latest"):
                    if args.get(key):
                        query[key] = args[key]
            elif operation == "search_messages":
                method = "search.messages"
                query = {
                    "query": args["query"],
                    "count": args.get("count", min(50, self.config.max_page_size)),
                    "page": args.get("page", 1),
                }
                for key in ("sort", "sort_dir"):
                    if args.get(key):
                        query[key] = args[key]
            else:
                raise ConnectorValidationError("Slack operation is not allowlisted.")

            data = self.client.call(method, query=query, access_token=token)
            return ConnectorResult("slack", operation, True, data=data)
        except (ConnectorError, ConnectorValidationError, ValueError) as exc:
            return ConnectorResult("slack", operation, False, error=str(exc))
        except Exception:
            return ConnectorResult("slack", operation, False, error="Slack request failed.")
