"""Input validation for configured Zoho operations."""
from ai.connectors.exceptions import ConnectorValidationError


def validate_zoho_arguments(operation, arguments):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("Arguments must be an object.")
    allowed = set(operation.query_parameters)
    unknown = set(arguments) - allowed
    if unknown:
        raise ConnectorValidationError(
            "Unsupported query parameters: " + ", ".join(sorted(unknown))
        )
    clean = {}
    for key, value in arguments.items():
        if isinstance(value, bool) or not isinstance(value, (str, int, float)):
            raise ConnectorValidationError(f"Invalid value for parameter '{key}'.")
        if isinstance(value, str) and len(value) > 2000:
            raise ConnectorValidationError(f"Parameter '{key}' is too long.")
        if isinstance(value, (int, float)) and abs(value) > 1e12:
            raise ConnectorValidationError(f"Parameter '{key}' is out of range.")
        clean[key] = value
    return clean
