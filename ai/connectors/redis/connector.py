"""Read-only Redis connector."""
from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorMetadata, ConnectorResult
from .schemas import validate_redis_arguments


class RedisConnector(Connector):
    def __init__(self, config, client):
        self.config = config
        self.client = client
        schemas = {
            "ping": {"type": "object", "properties": {}, "required": [], "additionalProperties": False},
            "list_keys": {
                "type": "object",
                "properties": {
                    "pattern": {"type": "string", "maxLength": 128},
                    "limit": {"type": "integer", "minimum": 1, "maximum": config.max_results},
                },
                "required": [],
                "additionalProperties": False,
            },
            "get_key_type": {
                "type": "object",
                "properties": {"key": {"type": "string", "minLength": 1, "maxLength": 512}},
                "required": ["key"],
                "additionalProperties": False,
            },
            "get_value": {
                "type": "object",
                "properties": {
                    "key": {"type": "string", "minLength": 1, "maxLength": 512},
                    "limit": {"type": "integer", "minimum": 1, "maximum": config.max_results},
                },
                "required": ["key"],
                "additionalProperties": False,
            },
        }
        super().__init__(ConnectorMetadata(
            name="redis",
            version="1.0.0",
            description="Read-only Redis health, key inspection, and bounded value retrieval.",
            operations=tuple(schemas),
            operation_schemas=schemas,
            required_permissions=config.required_permissions,
        ))

    async def execute(self, request, credentials):
        operation = request.operation
        try:
            self.validate_operation(operation)
            args = validate_redis_arguments(
                self.metadata, operation, dict(request.arguments or {}), self.config
            )
            if operation == "ping":
                data = self.client.ping()
            elif operation == "list_keys":
                data = self.client.list_keys(args["pattern"], args["limit"])
            elif operation == "get_key_type":
                data = self.client.get_key_type(args["key"])
            elif operation == "get_value":
                data = self.client.get_value(args["key"], args["limit"])
            else:
                raise ConnectorValidationError("Unsupported Redis operation")
            return ConnectorResult(
                connector=self.metadata.name, operation=operation,
                success=True, data=data,
            )
        except (ConnectorError, ConnectorValidationError, ValueError) as exc:
            return ConnectorResult(
                connector=self.metadata.name, operation=operation,
                success=False, error=str(exc),
            )
        except Exception:
            return ConnectorResult(
                connector=self.metadata.name, operation=operation,
                success=False, error="Redis request failed",
            )
