"""JSON-RPC message serialization."""

from ai.mcp.constants import MAX_MESSAGE_BYTES
from ai.mcp.schemas import validate_jsonrpc_message
from ai.mcp.utils import json_dumps, json_loads


def encode_message(message) -> bytes:
    validate_jsonrpc_message(message)
    encoded = json_dumps(message).encode("utf-8")
    if len(encoded) > MAX_MESSAGE_BYTES:
        raise ValueError("Message exceeds maximum allowed size.")
    return encoded


def decode_message(payload):
    if isinstance(payload, str):
        payload = payload.encode("utf-8")
    if not isinstance(payload, bytes):
        raise TypeError("Payload must be bytes or text.")
    if len(payload) > MAX_MESSAGE_BYTES:
        raise ValueError("Message exceeds maximum allowed size.")
    return validate_jsonrpc_message(json_loads(payload))
