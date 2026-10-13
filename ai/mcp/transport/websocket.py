"""WebSocket transport adapter using a supplied WebSocket connection."""
import json

from ai.mcp.transport.utils import (
    decode_transport_message,
    encode_transport_message,
)


async def handle_websocket_connection(websocket, server) -> None:
    """Serve MCP messages over a connected WebSocket.

    The caller owns WebSocket creation, authentication, and lifecycle.
    """
    try:
        async for payload in websocket:
            try:
                message = decode_transport_message(payload)
                response = await server.handle(message)
                if response is not None:
                    await websocket.send(encode_transport_message(response))
            except (ValueError, UnicodeDecodeError, TypeError):
                # A malformed frame must not expose internal exceptions.
                error = {
                    "jsonrpc": "2.0",
                    "id": None,
                    "error": {"code": -32700, "message": "Parse error"},
                }
                await websocket.send(json.dumps(error))
    except (ConnectionError, OSError):
        return
