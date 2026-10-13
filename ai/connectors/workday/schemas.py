"""Validation and safe rendering of configured Workday operations."""
import re
from urllib.parse import quote

from ai.connectors.exceptions import ConnectorValidationError


def validate_workday_arguments(operation, arguments, config):
    operations = {item.name: item for item in config.operations}
    if operation not in operations:
        raise ConnectorValidationError("Workday operation is not configured.")
    if not isinstance(arguments, dict) or set(arguments) - {"path_params", "query", "limit", "offset"}:
        raise ConnectorValidationError("Invalid Workday arguments.")

    item = operations[operation]
    path_params = arguments.get("path_params", {})
    query = arguments.get("query", {})
    if not isinstance(path_params, dict) or set(path_params) != set(item.path_parameters):
        raise ConnectorValidationError("Workday path parameters do not match the configured operation.")
    if not isinstance(query, dict) or len(query) > 50:
        raise ConnectorValidationError("Invalid Workday query parameters.")

    safe_params = {}
    for key, value in path_params.items():
        if not isinstance(value, (str, int)) or isinstance(value, bool):
            raise ConnectorValidationError("Invalid Workday path parameter value.")
        value = str(value)
        if not value or len(value) > 200 or any(ord(c) < 32 for c in value):
            raise ConnectorValidationError("Invalid Workday path parameter value.")
        safe_params[key] = quote(value, safe="-._~")

    safe_query = {}
    for key, value in query.items():
        if not isinstance(key, str) or not re.fullmatch(r"[A-Za-z][A-Za-z0-9_.-]{0,63}", key):
            raise ConnectorValidationError("Invalid Workday query key.")
        if isinstance(value, bool):
            safe_query[key] = "true" if value else "false"
        elif isinstance(value, (str, int, float)) and not isinstance(value, bool):
            if isinstance(value, float) and (value != value or abs(value) == float("inf")):
                raise ConnectorValidationError("Invalid Workday query value.")
            value = str(value)
            if len(value) > 500 or any(ord(c) < 32 for c in value):
                raise ConnectorValidationError("Invalid Workday query value.")
            safe_query[key] = value
        else:
            raise ConnectorValidationError("Workday query values must be scalar.")

    for key in ("limit", "offset"):
        if key in arguments:
            value = arguments[key]
            if isinstance(value, bool) or not isinstance(value, int):
                raise ConnectorValidationError(f"Invalid Workday {key}.")
            if key == "limit" and not 1 <= value <= config.max_page_size:
                raise ConnectorValidationError("Workday limit exceeds the configured bound.")
            if key == "offset" and not 0 <= value <= 100000:
                raise ConnectorValidationError("Workday offset exceeds the configured bound.")
            safe_query[key] = str(value)

    path = item.path
    for key, value in safe_params.items():
        path = path.replace("{" + key + "}", value)
    if "{" in path or "}" in path:
        raise ConnectorValidationError("Unresolved Workday path parameter.")
    if any(part in {".", ".."} for part in path.split("/")):
        raise ConnectorValidationError("Workday path traversal is not allowed.")
    return item, path, safe_query
