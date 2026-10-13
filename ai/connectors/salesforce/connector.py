"""Read-only Salesforce connector."""
from ai.connectors.connector import Connector
from ai.connectors.exceptions import (
    ConnectorAuthenticationError,
    ConnectorError,
    ConnectorValidationError,
)
from ai.connectors.models import ConnectorMetadata, ConnectorResult
from .client import SalesforceClient
from .schemas import validate_salesforce_arguments


class SalesforceConnector(Connector):
    def __init__(self, config, client=None):
        self.config = config
        self.client = client or SalesforceClient(config)
        schemas = {
            "list_objects": {
                "type": "object", "properties": {}, "additionalProperties": False
            },
            "get_record": {
                "type": "object",
                "properties": {
                    "object_name": {"type": "string"},
                    "record_id": {"type": "string"},
                },
                "required": ["object_name", "record_id"],
                "additionalProperties": False,
            },
            "query_records": {
                "type": "object",
                "properties": {"soql": {"type": "string", "maxLength": 20000}},
                "required": ["soql"],
                "additionalProperties": False,
            },
        }
        super().__init__(ConnectorMetadata(
            name="salesforce",
            version="1.0.0",
            description="Read Salesforce objects and records using the REST API.",
            operations=tuple(schemas),
            operation_schemas=schemas,
            required_permissions=config.required_permissions,
        ))

    async def execute(self, request, credentials):
        operation = request.operation
        try:
            args = validate_salesforce_arguments(operation, request.arguments or {})
            token = credentials.get("access_token")
            if not token:
                raise ConnectorAuthenticationError("Salesforce access token is missing.")

            if operation == "list_objects":
                data = self.client.request(
                    "GET", "sobjects/", access_token=token
                )
            elif operation == "get_record":
                data = self.client.request(
                    "GET",
                    f"sobjects/{args['object_name']}/{args['record_id']}",
                    access_token=token,
                )
            elif operation == "query_records":
                data = self.client.request(
                    "GET",
                    "query",
                    query={"q": args["soql"]},
                    access_token=token,
                )
            else:
                raise ConnectorValidationError("Salesforce operation is not allowlisted.")

            return ConnectorResult("salesforce", operation, True, data=data)
        except (ConnectorError, ConnectorValidationError, ValueError) as exc:
            return ConnectorResult("salesforce", operation, False, error=str(exc))
        except Exception:
            return ConnectorResult(
                "salesforce", operation, False,
                error="Salesforce request failed."
            )
