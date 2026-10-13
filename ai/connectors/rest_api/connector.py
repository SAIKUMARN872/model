"""Configured REST API connector."""
from ai.connectors.connector import Connector
from ai.connectors.exceptions import (
    ConnectorAuthenticationError,
    ConnectorError,
    ConnectorValidationError,
)
from ai.connectors.models import ConnectorMetadata, ConnectorResult
from .client import RESTAPIClient
from .schemas import validate_rest_arguments


class RESTAPIConnector(Connector):
    def __init__(self, config, client=None):
        self.config = config
        self.client = client or RESTAPIClient.from_config(config)
        self._operations = {op.name: op for op in config.operations}
        schemas = {
            name: {
                "type": "object",
                "properties": {
                    "query": {"type": "object"},
                    "body": {"type": "object"},
                },
                "required": [],
                "additionalProperties": False,
            }
            for name in self._operations
        }
        permissions = set(config.required_permissions)
        for op in config.operations:
            permissions.update(op.required_permissions)
        super().__init__(ConnectorMetadata(
            name="rest_api",
            version="1.0.0",
            description="Execute explicitly configured REST API operations.",
            operations=tuple(self._operations),
            operation_schemas=schemas,
            required_permissions=tuple(sorted(permissions)),
        ))

    async def execute(self, request, credentials):
        name = request.operation
        try:
            operation = self._operations.get(name)
            if operation is None:
                raise ConnectorValidationError("REST operation is not allowlisted.")
            args = validate_rest_arguments(
                operation, dict(request.arguments or {})
            )
            token = None
            if self.config.credential_env_var:
                token = credentials.get("access_token")
                if not token:
                    raise ConnectorAuthenticationError("REST API access token is missing.")
            data = self.client.request(
                operation,
                query=args.get("query"),
                body=args.get("body"),
                access_token=token,
            )
            return ConnectorResult("rest_api", name, True, data=data)
        except (ConnectorError, ConnectorValidationError, ValueError) as exc:
            return ConnectorResult("rest_api", name, False, error=str(exc))
        except Exception:
            return ConnectorResult("rest_api", name, False, error="REST API request failed.")
