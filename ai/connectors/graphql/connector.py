"""Allowlisted GraphQL connector."""
from typing import Mapping

from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorAuthenticationError, ConnectorValidationError
from ai.connectors.models import ConnectorMetadata, ConnectorRequest, ConnectorResult
from ai.connectors.graphql.client import GraphQLClient
from ai.connectors.graphql.config import GraphQLConfig
from ai.connectors.graphql.models import GraphQLOperation
from ai.connectors.graphql.schemas import validate_variables


class GraphQLConnector(Connector):
    def __init__(self, config: GraphQLConfig, client: GraphQLClient | None = None):
        self.config = config
        self.client = client or GraphQLClient(
            config.endpoint_url, config.allowed_hosts, config.timeout_seconds
        )
        self._operations = {
            op.name: GraphQLOperation(
                op.name, op.query, op.operation_type,
                op.variable_schema or {"type": "object", "properties": {}, "additionalProperties": False},
                op.required_permissions,
            )
            for op in config.operations
        }
        self._operation_schemas = {
            name: {
                "type": "object",
                "properties": {
                    "variables": {
                        "type": "object",
                        "properties": dict(op.variable_schema or {}).get("properties", {}),
                        "required": dict(op.variable_schema or {}).get("required", []),
                        "additionalProperties": dict(op.variable_schema or {}).get("additionalProperties", False),
                    }
                },
                "required": ["variables"],
                "additionalProperties": False,
            }
            for name, op in self._operations.items()
        }
        required = tuple(sorted({
            permission
            for op in config.operations
            for permission in op.required_permissions
        }))
        super().__init__(ConnectorMetadata(
            name="graphql",
            version="1.0.0",
            description="Execute explicitly configured GraphQL operations.",
            operations=tuple(self._operations),
            operation_schemas=self._operation_schemas,
            required_permissions=required,
        ))

    async def execute(self, request: ConnectorRequest, credentials: Mapping[str, str]) -> ConnectorResult:
        operation = request.operation
        try:
            configured = self._operations.get(operation)
            if configured is None:
                raise ConnectorValidationError("GraphQL operation is not allowlisted.")
            if configured.operation_type == "mutation" and not self.config.enable_mutations:
                raise ConnectorValidationError("GraphQL mutations are disabled.")
            args = dict(request.arguments or {})
            if set(args) - {"variables"}:
                raise ConnectorValidationError("Unsupported GraphQL operation arguments.")
            variables = validate_variables(configured.variable_schema, args.get("variables", {}))
            token = credentials.get("access_token")
            if not token and self.config.credential_env_var:
                raise ConnectorAuthenticationError("GraphQL access token is missing.")
            data = self.client.execute(configured.query, variables, access_token=token)
            return ConnectorResult("graphql", operation, True, data=data)
        except Exception as exc:
            safe_errors = (ConnectorValidationError, ConnectorAuthenticationError)
            return ConnectorResult(
                "graphql", operation, False,
                error=str(exc) if isinstance(exc, safe_errors) else "GraphQL operation failed."
            )
