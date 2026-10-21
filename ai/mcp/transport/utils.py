"""Shared JSON message helpers for MCP transports."""
import json
from typing import Any

from ai.mcp.constants import MAX_MESSAGE_SIZE


def encode_transport_message(message: dict[str, Any]) -> str:
    if not isinstance(message, dict):
        raise TypeError("MCP messages must be dictionaries")
    payload = json.dumps(message, separators=(",", ":"), ensure_ascii=False)
    if len(payload.encode("utf-8")) > MAX_MESSAGE_SIZE:
        raise ValueError("MCP message exceeds the configured size limit")
    return payload


def decode_transport_message(payload: str | bytes) -> dict[str, Any]:
    if isinstance(payload, bytes):
        if len(payload) > MAX_MESSAGE_SIZE:
            raise ValueError("MCP message exceeds the configured size limit")
        payload = payload.decode("utf-8")
    elif len(payload.encode("utf-8")) > MAX_MESSAGE_SIZE:
        raise ValueError("MCP message exceeds the configured size limit")

    message = json.loads(payload)
    if not isinstance(message, dict):
        raise ValueError("An MCP message must be a JSON object")
    return message
