"""Input validation for configured SAP entity operations."""
import re

from ai.connectors.exceptions import ConnectorValidationError

_FIELD = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,99}$")


def validate_sap_arguments(operation, arguments, config):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("SAP arguments must be an object.")

    allowed = {
        "list_entities": {"entity", "top", "skip", "select"},
        "get_entity": {"entity", "key", "select"},
    }
    if operation not in allowed:
        raise ConnectorValidationError("SAP operation is not allowlisted.")
    if set(arguments) - allowed[operation]:
        raise ConnectorValidationError("Unsupported SAP arguments.")

    entity_name = arguments.get("entity")
    entities = {entity.name: entity for entity in config.entities}
    if not isinstance(entity_name, str) or entity_name not in entities:
        raise ConnectorValidationError("SAP entity is not configured.")

    result = dict(arguments)
    if "top" in result:
        top = result["top"]
        if isinstance(top, bool) or not isinstance(top, int) or not 1 <= top <= config.max_page_size:
            raise ConnectorValidationError("Invalid SAP page size.")
    if "skip" in result:
        skip = result["skip"]
        if isinstance(skip, bool) or not isinstance(skip, int) or not 0 <= skip <= 100000:
            raise ConnectorValidationError("Invalid SAP offset.")
    if operation == "get_entity":
        key = result.get("key")
        if not isinstance(key, str) or not key or len(key) > 200:
            raise ConnectorValidationError("Invalid SAP entity key.")
        if any(ord(char) < 32 for char in key):
            raise ConnectorValidationError("Invalid SAP entity key.")
    if "select" in result:
        select = result["select"]
        if (
            not isinstance(select, list)
            or not select
            or len(select) > 50
            or any(not isinstance(field, str) or not _FIELD.fullmatch(field) for field in select)
        ):
            raise ConnectorValidationError("Invalid SAP selected fields.")
    return result
