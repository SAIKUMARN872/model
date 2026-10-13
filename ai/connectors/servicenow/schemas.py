"""Validation for read-only ServiceNow Table API operations."""
import re

from ai.connectors.exceptions import ConnectorValidationError

_SYS_ID = re.compile(r"^[a-fA-F0-9]{32}$")
_FIELD = re.compile(r"^[A-Za-z_][A-Za-z0-9_.]{0,99}$")


def validate_servicenow_arguments(operation, arguments, config):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("ServiceNow arguments must be an object.")

    allowed = {
        "list_records": {"table", "limit", "offset", "fields", "sysparm_query"},
        "get_record": {"table", "sys_id", "fields"},
    }
    if operation not in allowed:
        raise ConnectorValidationError("ServiceNow operation is not allowlisted.")
    if set(arguments) - allowed[operation]:
        raise ConnectorValidationError("Unsupported ServiceNow arguments.")

    alias = arguments.get("table")
    configured = {item.name for item in config.tables}
    if not isinstance(alias, str) or alias not in configured:
        raise ConnectorValidationError("ServiceNow table is not configured.")

    result = dict(arguments)
    if "limit" in result:
        limit = result["limit"]
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= config.max_page_size:
            raise ConnectorValidationError("Invalid ServiceNow page limit.")
    if "offset" in result:
        offset = result["offset"]
        if isinstance(offset, bool) or not isinstance(offset, int) or not 0 <= offset <= 100000:
            raise ConnectorValidationError("Invalid ServiceNow offset.")
    if operation == "get_record":
        sys_id = result.get("sys_id")
        if not isinstance(sys_id, str) or not _SYS_ID.fullmatch(sys_id):
            raise ConnectorValidationError("Invalid ServiceNow sys_id.")
    if "fields" in result:
        fields = result["fields"]
        if (
            not isinstance(fields, list)
            or not fields
            or len(fields) > 100
            or any(not isinstance(field, str) or not _FIELD.fullmatch(field) for field in fields)
        ):
            raise ConnectorValidationError("Invalid ServiceNow fields.")
    if "sysparm_query" in result:
        query = result["sysparm_query"]
        if (
            not isinstance(query, str)
            or not query.strip()
            or len(query) > 2000
            or any(ord(char) < 32 for char in query)
            or ";" in query
        ):
            raise ConnectorValidationError("Invalid ServiceNow query filter.")
    return result
