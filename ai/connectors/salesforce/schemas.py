"""Validation for read-only Salesforce operations."""
import re

from ai.connectors.exceptions import ConnectorValidationError

_OBJECT_NAME = re.compile(r"^[A-Za-z][A-Za-z0-9_]{0,79}$")
_RECORD_ID = re.compile(r"^[A-Za-z0-9]{15}(?:[A-Za-z0-9]{3})?$")
_FORBIDDEN = re.compile(
    r"\b(?:INSERT|UPDATE|DELETE|UPSERT|MERGE|UNDELETE|CREATE|ALTER|DROP|TRUNCATE)\b",
    re.IGNORECASE,
)


def validate_soql(query):
    if not isinstance(query, str) or not query.strip():
        raise ConnectorValidationError("SOQL query is required.")
    query = query.strip()
    if len(query) > 20000:
        raise ConnectorValidationError("SOQL query is too long.")
    if not re.match(r"^SELECT\b", query, re.IGNORECASE):
        raise ConnectorValidationError("Only SELECT SOQL queries are supported.")
    if (
        ";" in query
        or "--" in query
        or "/*" in query
        or "*/" in query
        or _FORBIDDEN.search(query)
        or re.search(r"\bFOR\s+UPDATE\b", query, re.IGNORECASE)
    ):
        raise ConnectorValidationError("SOQL query contains unsupported syntax.")
    return query


def validate_salesforce_arguments(operation, arguments):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("Salesforce arguments must be an object.")

    if operation == "list_objects":
        if arguments:
            raise ConnectorValidationError("list_objects accepts no arguments.")
        return {}

    if operation == "get_record":
        if set(arguments) != {"object_name", "record_id"}:
            raise ConnectorValidationError(
                "get_record requires object_name and record_id only."
            )
        object_name = arguments["object_name"]
        record_id = arguments["record_id"]
        if not isinstance(object_name, str) or not _OBJECT_NAME.fullmatch(object_name):
            raise ConnectorValidationError("Invalid Salesforce object name.")
        if not isinstance(record_id, str) or not _RECORD_ID.fullmatch(record_id):
            raise ConnectorValidationError("Invalid Salesforce record ID.")
        return {"object_name": object_name, "record_id": record_id}

    if operation == "query_records":
        if set(arguments) != {"soql"}:
            raise ConnectorValidationError("query_records requires SOQL only.")
        return {"soql": validate_soql(arguments["soql"])}

    raise ConnectorValidationError("Salesforce operation is not allowlisted.")
