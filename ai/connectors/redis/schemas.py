"""Redis operation argument validation."""
import math

from ai.connectors.exceptions import ConnectorValidationError


def validate_redis_arguments(metadata, operation, arguments, config):
    if not isinstance(arguments, dict):
        raise ConnectorValidationError("arguments must be an object")
    schema = metadata.operation_schemas.get(operation)
    if schema is None:
        raise ConnectorValidationError("Unsupported Redis operation")
    if set(arguments) - set(schema["properties"]):
        raise ConnectorValidationError("Unknown Redis argument")
    for name in schema["required"]:
        if name not in arguments:
            raise ConnectorValidationError(f"Missing required argument: {name}")

    result = dict(arguments)
    if operation in ("get_key_type", "get_value"):
        key = result["key"]
        if not isinstance(key, str) or not key or len(key.encode("utf-8")) > 512 or any(ord(c) < 32 for c in key):
            raise ConnectorValidationError("Invalid Redis key")
    if operation == "list_keys":
        pattern = result.get("pattern", "*")
        if not isinstance(pattern, str) or not pattern or len(pattern) > 128 or any(ord(c) < 32 for c in pattern):
            raise ConnectorValidationError("Invalid Redis key pattern")
        limit = result.get("limit", min(50, config.max_results))
        result.update(pattern=pattern, limit=limit)
    elif operation == "get_value":
        result["limit"] = result.get("limit", min(50, config.max_results))

    if operation in ("list_keys", "get_value"):
        limit = result["limit"]
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= config.max_results:
            raise ConnectorValidationError("Invalid Redis result limit")
    return result
