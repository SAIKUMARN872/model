"""Framework-independent HTTP transport adapter with optional authentication."""
from ai.mcp.authentication import AuthenticationError
from ai.mcp.constants import MAX_MESSAGE_BYTES
from ai.mcp.transport.utils import (
    decode_transport_message,
    encode_transport_message,
)


class MCPHTTPTransport:
    """Adapt HTTP request bodies to an MCP server handler.

    Supply an authenticator to require bearer-token authentication.
    TLS, network rate limiting, and deployment-specific CORS remain
    responsibilities of the hosting application.
    """

    def __init__(
        self,
        server,
        *,
        authenticator=None,
        required_scopes=(),
        require_auth=False,
    ):
        if require_auth and authenticator is None:
            raise ValueError("Authentication requires an authenticator.")
        self.server = server
        self.authenticator = authenticator
        self.required_scopes = frozenset(required_scopes)
        self.require_auth = require_auth or authenticator is not None

    async def handle_request(
        self,
        body: bytes | str,
        *,
        content_type: str = "application/json",
        headers=None,
    ) -> tuple[int, dict[str, str], bytes]:
        response_headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
        }

        if not isinstance(content_type, str) or "json" not in content_type.lower():
            return 415, response_headers, b'{"error":"Unsupported content type"}'

        if isinstance(body, str):
            body_size = len(body.encode("utf-8"))
        elif isinstance(body, bytes):
            body_size = len(body)
        else:
            return 400, response_headers, b'{"error":"Invalid request body"}'

        if body_size > MAX_MESSAGE_BYTES:
            return 413, response_headers, b'{"error":"Request body too large"}'

        if self.require_auth:
            try:
                principal = self.authenticator.authenticate_headers(headers or {})
            except AuthenticationError:
                return 401, response_headers, b'{"error":"Invalid or missing bearer token"}'

            try:
                self.authenticator.require_scopes(
                    principal, self.required_scopes
                )
            except AuthenticationError:
                return 403, response_headers, b'{"error":"Insufficient token scopes"}'

        try:
            message = decode_transport_message(body)
        except (ValueError, UnicodeDecodeError, TypeError):
            return 400, response_headers, b'{"error":"Invalid JSON-RPC message"}'

        try:
            response = await self.server.handle(message)
        except Exception:
            return 500, response_headers, b'{"error":"Internal MCP server error"}'

        if response is None:
            return 202, response_headers, b""

        try:
            encoded = encode_transport_message(response).encode("utf-8")
        except (TypeError, ValueError):
            return 500, response_headers, b'{"error":"Could not encode MCP response"}'

        return 200, response_headers, encoded
