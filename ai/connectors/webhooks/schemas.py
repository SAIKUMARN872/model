"""Validation for configured webhook operations."""
from ai.connectors.exceptions import ConnectorValidationError


def validate_webhook_arguments(operation, arguments, config):
    configured = {item.name: item for item in config.operations}
    if operation not in configured:
        raise ConnectorValidationError("Webhook operation is not configured.")
    if not isinstance(arguments, dict) or set(arguments) != {"payload"}:
        raise ConnectorValidationError("Webhook arguments must contain only payload.")
    payload = arguments["payload"]
    if not isinstance(payload, dict):
        raise ConnectorValidationError("Webhook payload must be a JSON object.")
    return configured[operation], payload
