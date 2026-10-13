"""Read-only SAP OData connector."""
from ai.connectors.connector import Connector
from ai.connectors.exceptions import ConnectorError, ConnectorValidationError
from ai.connectors.models import ConnectorMetadata, ConnectorResult
from .client import SAPClient
from .schemas import validate_sap_arguments


class SAPConnector(Connector):
    def __init__(self, config, client=None):
        self.config = config
        self.client = client or SAPClient(config)
        self._entities = {entity.name: entity for entity in config.entities}
        schemas = {
            "list_entities": {
                "type": "object",
                "properties": {
                    "entity": {"type": "string"},
                    "top": {"type": "integer", "minimum": 1, "maximum": config.max_page_size},
                    "skip": {"type": "integer", "minimum": 0, "maximum": 100000},
                    "select": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["entity"],
                "additionalProperties": False,
            },
            "get_entity": {
                "type": "object",
                "properties": {
                    "entity": {"type": "string"},
                    "key": {"type": "string", "maxLength": 200},
                    "select": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["entity", "key"],
                "additionalProperties": False,
            },
        }
        permissions = set(config.required_permissions)
        for entity in config.entities:
            permissions.update(entity.required_permissions)
        super().__init__(ConnectorMetadata(
            name="sap",
            version="1.0.0",
            description="Read configured SAP OData entity sets and entities.",
            operations=tuple(schemas),
            operation_schemas=schemas,
            required_permissions=tuple(sorted(permissions)),
        ))

    async def execute(self, request, credentials):
        operation = request.operation
        try:
            args = validate_sap_arguments(
                operation, request.arguments or {}, self.config
            )
            token = credentials.get("access_token")
            if not token:
                from ai.connectors.exceptions import ConnectorAuthenticationError
                raise ConnectorAuthenticationError("SAP access token is missing.")
            entity = self._entities[args["entity"]]
            select = args.get("select")
            query = {}
            if select:
                query["$select"] = ",".join(select)

            if operation == "list_entities":
                query["$top"] = args.get("top", min(50, self.config.max_page_size))
                if "skip" in args:
                    query["$skip"] = args["skip"]
                path = entity.entity_set
            elif operation == "get_entity":
                key = args["key"].replace("'", "''")
                path = f"{entity.entity_set}('{key}')"
            else:
                raise ConnectorValidationError("SAP operation is not allowlisted.")

            data = self.client.get(path, query=query, access_token=token)
            return ConnectorResult("sap", operation, True, data=data)
        except (ConnectorError, ConnectorValidationError, ValueError) as exc:
            return ConnectorResult("sap", operation, False, error=str(exc))
        except Exception:
            return ConnectorResult("sap", operation, False, error="SAP request failed.")
