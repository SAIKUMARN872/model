"""Read-only Workday REST connector."""
from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorMetadata, ConnectorResult
from .client import WorkdayClient
from .config import WorkdayConfig
from .schemas import validate_workday_arguments


class WorkdayConnector(Connector):
    def __init__(self, config, client=None):
        if not isinstance(config, WorkdayConfig):
            raise TypeError("config must be WorkdayConfig")
        self.config = config
        self.client = client or WorkdayClient(config)
        schemas = {
            item.name: {
                "type": "object",
                "properties": {
                    "path_params": {"type": "object"},
                    "query": {"type": "object"},
                    "limit": {"type": "integer", "minimum": 1, "maximum": config.max_page_size},
                    "offset": {"type": "integer", "minimum": 0, "maximum": 100000},
                },
                "additionalProperties": False,
            }
            for item in config.operations
        }
        super().__init__(ConnectorMetadata(
            name="workday",
            version="1.0.0",
            description="Read-only access to explicitly configured Workday REST operations.",
            operations=tuple(schemas),
            operation_schemas=schemas,
            required_permissions=config.required_permissions,
        ))

    async def execute(self, request, credentials):
        operation = request.operation
        try:
            item, path, query = validate_workday_arguments(
                operation, request.arguments or {}, self.config
            )
            token = (credentials or {}).get("access_token")
            if not token:
                from ai.connectors.exceptions import ConnectorAuthenticationError
                raise ConnectorAuthenticationError("Workday access token is missing.")
            data = self.client.get(path, query=query, access_token=token)
            return ConnectorResult("workday", operation, True, data=data)
        except (ConnectorError, ConnectorValidationError, ValueError) as exc:
            return ConnectorResult("workday", operation, False, error=str(exc))
        except Exception:
            return ConnectorResult("workday", operation, False, error="Workday request failed.")
