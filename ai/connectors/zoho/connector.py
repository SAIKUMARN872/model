"""Generic, configured, read-only Zoho connector."""
from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError
from ai.connectors.models import ConnectorMetadata, ConnectorResult
from .schemas import validate_zoho_arguments


class ZohoConnector(Connector):
    def __init__(self, config, client=None):
        from .client import ZohoClient
        self.config = config
        self.client = client or ZohoClient(config)
        self._operations = {op.name: op for op in config.operations}
        super().__init__(ConnectorMetadata(
            name="zoho",
            version=config.version,
            description="Configurable read-only Zoho API connector",
            operations=tuple(self._operations),
            operation_schemas={
                op.name: {
                    "type": "object",
                    "properties": {
                        key: {"type": "string"}
                        for key in op.query_parameters
                    },
                    "additionalProperties": False,
                }
                for op in config.operations
            },
            required_permissions=config.required_permissions,
        ))

    async def execute(self, request, credentials):
        name = request.operation
        try:
            self.validate_operation(name)
            operation = self._operations[name]
            arguments = validate_zoho_arguments(operation, dict(request.arguments or {}))
            token = credentials.get("token") if hasattr(credentials, "get") else None
            if not isinstance(token, str) or not token.strip():
                return ConnectorResult("zoho", name, False, error="Zoho access token is missing.")
            data = self.client.request(operation.path, token=token, query=arguments or None)
            return ConnectorResult("zoho", name, True, data=data)
        except (ConnectorError, ValueError) as exc:
            return ConnectorResult("zoho", name, False, error=str(exc))
        except Exception:
            return ConnectorResult("zoho", name, False, error="Zoho request failed.")
