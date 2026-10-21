"""Protocol facade for JSON-RPC message handling."""

from .messages import (
    error_response,
    notification,
    request,
    success_response,
)
from .serialization import decode_message, encode_message

__all__ = [
    "request", "notification", "success_response", "error_response",
    "encode_message", "decode_message",
]
