"""Read-only ServiceNow Table API connector."""
from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorMetadata, ConnectorResult
from .client import ServiceNowClient
from .schemas import validate_servicenow_arguments


class ServiceNowConnector(Connector):
    def __init__(self, config, client=None):
        self.config = config
        self.client = client or ServiceNowClient(config)
        self._tables = {table.name: table for table in config.tables}
        schemas = {
            "list_records": {
                "type": "object",
                "properties": {
                    "table": {"type": "string"},
                    "limit": {"type": "integer", "minimum": 1, "maximum": config.max_page_size},
                    "offset": {"type": "integer", "minimum": 0, "maximum": 100000},
                    "fields": {"type": "array", "items": {"type": "string"}},
                    "sysparm_query": {"type": "string", "maxLength": 2000},
                },
                "required": ["table"],
                "additionalProperties": False,
            },
            "get_record": {
                "type": "object",
                "properties": {
                    "table": {"type": "string"},
                    "sys_id": {"type": "string"},
                    "fields": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["table", "sys_id"],
                "additionalProperties": False,
            },
        }
        permissions = set(config.required_permissions)
        for table in config.tables:
            permissions.update(table.required_permissions)
        super().__init__(ConnectorMetadata(
            name="servicenow",
            version="1.0.0",
            description="Read configured ServiceNow Table API records.",
            operations=tuple(schemas),
            operation_schemas=schemas,
            required_permissions=tuple(sorted(permissions)),
        ))

    async def execute(self, request, credentials):
        operation = request.operation
        try:
            args = validate_servicenow_arguments(
                operation, request.arguments or {}, self.config
            )
            token = credentials.get("access_token")
            if not token:
                from ai.connectors.exceptions import ConnectorAuthenticationError
                raise ConnectorAuthenticationError("ServiceNow access token is missing.")
            table = self._tables[args["table"]]
            query = {}
            if operation == "list_records":
                query["sysparm_limit"] = args.get("limit", min(50, self.config.max_page_size))
                query["sysparm_offset"] = args.get("offset", 0)
                if args.get("fields"):
                    query["sysparm_fields"] = ",".join(args["fields"])
                if args.get("sysparm_query"):
                    query["sysparm_query"] = args["sysparm_query"]
                path = f"table/{table.table_name}"
            elif operation == "get_record":
                if args.get("fields"):
                    query["sysparm_fields"] = ",".join(args["fields"])
                path = f"table/{table.table_name}/{args['sys_id']}"
            else:
                raise ConnectorValidationError("ServiceNow operation is not allowlisted.")

            data = self.client.get(path, query=query, access_token=token)
            return ConnectorResult("servicenow", operation, True, data=data)
        except (ConnectorError, ConnectorValidationError, ValueError) as exc:
            return ConnectorResult("servicenow", operation, False, error=str(exc))
        except Exception:
            return ConnectorResult(
                "servicenow", operation, False,
                error="ServiceNow request failed."
            )
