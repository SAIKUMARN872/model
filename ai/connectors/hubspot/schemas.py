"""HubSpot operation schemas, argument validation, and safe path building."""

import re
from urllib.parse import quote

from ai.connectors.exceptions import ConnectorValidationError
from ai.connectors.models import ConnectorMetadata
from ai.connectors.schemas import validate_connector_arguments
from ai.connectors.hubspot.models import HubSpotOperation

_ID_PATTERN = re.compile(r"^[0-9]{1,30}$")
_PROPERTY_PATTERN = re.compile(r"^[A-Za-z][A-Za-z0-9_]{0,99}$")


def _object_schema(properties=None, required=None):
    return {
        "type": "object",
        "properties": properties or {},
        "required": required or [],
        "additionalProperties": False,
    }


def _common_list_properties():
    return {
        "limit": {"type": "integer", "minimum": 1, "maximum": 100},
        "after": {"type": "string", "maxLength": 100},
        "properties": {
            "type": "array",
            "items": {"type": "string"},
            "maxItems": 50,
        },
    }


def build_hubspot_operations():
    identifier = {"type": "string", "minLength": 1, "maxLength": 30}
    return (
        HubSpotOperation(
            name="get_contact",
            method="GET",
            path_template="/crm/v3/objects/contacts/{contact_id}",
            description="Retrieve a contact by ID.",
            schema=_object_schema({
                "contact_id": identifier,
                "properties": {
                    "type": "array",
                    "items": {"type": "string"},
                    "maxItems": 50,
                },
            }, ["contact_id"]),
        ),
        HubSpotOperation(
            name="list_contacts",
            method="GET",
            path_template="/crm/v3/objects/contacts",
            description="List contacts with pagination.",
            schema=_object_schema(_common_list_properties()),
        ),
        HubSpotOperation(
            name="search_contacts",
            method="POST",
            path_template="/crm/v3/objects/contacts/search",
            description="Search contacts by a text query.",
            schema=_object_schema({
                "query": {"type": "string", "minLength": 1, "maxLength": 1000},
                "limit": {"type": "integer", "minimum": 1, "maximum": 100},
                "after": {"type": "string", "maxLength": 100},
                "properties": {
                    "type": "array",
                    "items": {"type": "string"},
                    "maxItems": 50,
                },
            }, ["query"]),
        ),
        HubSpotOperation(
            name="get_company",
            method="GET",
            path_template="/crm/v3/objects/companies/{company_id}",
            description="Retrieve a company by ID.",
            schema=_object_schema({
                "company_id": identifier,
                "properties": {
                    "type": "array",
                    "items": {"type": "string"},
                    "maxItems": 50,
                },
            }, ["company_id"]),
        ),
        HubSpotOperation(
            name="get_deal",
            method="GET",
            path_template="/crm/v3/objects/deals/{deal_id}",
            description="Retrieve a deal by ID.",
            schema=_object_schema({
                "deal_id": identifier,
                "properties": {
                    "type": "array",
                    "items": {"type": "string"},
                    "maxItems": 50,
                },
            }, ["deal_id"]),
        ),
        HubSpotOperation(
            name="list_owners",
            method="GET",
            path_template="/crm/v3/owners",
            description="List HubSpot CRM owners.",
            schema=_object_schema({
                "limit": {"type": "integer", "minimum": 1, "maximum": 100},
                "after": {"type": "string", "maxLength": 100},
                "archived": {"type": "boolean"},
            }),
        ),
    )


def build_hubspot_metadata(config):
    operations = build_hubspot_operations()
    return ConnectorMetadata(
        name="hubspot",
        version=config.version,
        description=config.description,
        operations=tuple(op.name for op in operations),
        operation_schemas={op.name: op.schema for op in operations},
        required_permissions=config.required_permissions,
    )


def validate_hubspot_arguments(metadata, operation, arguments):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")

    validate_connector_arguments(metadata, operation, arguments)
    result = dict(arguments)

    for key in ("contact_id", "company_id", "deal_id"):
        if key in result:
            value = result[key]
            if not isinstance(value, str) or not _ID_PATTERN.fullmatch(value):
                raise ConnectorValidationError(f"{key} must contain only digits")

    for key in ("query", "after"):
        if key in result:
            value = result[key]
            if (
                not isinstance(value, str)
                or not value.strip()
                or len(value) > (1000 if key == "query" else 100)
                or any(ord(ch) < 32 for ch in value)
            ):
                raise ConnectorValidationError(f"{key} is invalid")

    for key in ("limit",):
        if key in result:
            value = result[key]
            if isinstance(value, bool) or not isinstance(value, int) or not 1 <= value <= 100:
                raise ConnectorValidationError("limit must be an integer from 1 to 100")

    if "archived" in result and not isinstance(result["archived"], bool):
        raise ConnectorValidationError("archived must be a boolean")

    if "properties" in result:
        properties = result["properties"]
        if not isinstance(properties, list) or len(properties) > 50:
            raise ConnectorValidationError("properties must be a list of at most 50 names")
        for name in properties:
            if not isinstance(name, str) or not _PROPERTY_PATTERN.fullmatch(name):
                raise ConnectorValidationError("property name is invalid")

    return result


def build_hubspot_path(operation, arguments):
    path = operation.path_template
    for key in ("contact_id", "company_id", "deal_id"):
        marker = "{" + key + "}"
        if marker in path:
            path = path.replace(marker, quote(arguments[key], safe=""))
    return path
