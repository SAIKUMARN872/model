"""Bearer-token authentication for MCP transports."""
from dataclasses import dataclass
from typing import Mapping

from ai.mcp.authentication.tokens import TokenRecord, TokenStore


class AuthenticationError(PermissionError):
    """Raised when a request has no valid bearer token."""


@dataclass(frozen=True)
class AuthenticatedPrincipal:
    subject: str
    scopes: frozenset[str]
    expires_at: float
    issued_at: float


class MCPAuthenticator:
    def __init__(self, token_store: TokenStore):
        self.token_store = token_store

    def authenticate_token(self, token: str) -> AuthenticatedPrincipal:
        record: TokenRecord | None = self.token_store.validate(token)
        if record is None:
            raise AuthenticationError("Invalid or expired access token")
        return AuthenticatedPrincipal(
            subject=record.subject,
            scopes=record.scopes,
            expires_at=record.expires_at,
            issued_at=record.issued_at,
        )

    def authenticate_headers(
        self, headers: Mapping[str, str]
    ) -> AuthenticatedPrincipal:
        authorization = next(
            (
                value for key, value in headers.items()
                if key.lower() == "authorization"
            ),
            None,
        )
        if not isinstance(authorization, str):
            raise AuthenticationError("Bearer token is required")

        scheme, separator, token = authorization.partition(" ")
        if not separator or scheme.lower() != "bearer" or not token.strip():
            raise AuthenticationError("Authorization must use Bearer scheme")

        if token.strip() != token or any(ch.isspace() for ch in token):
            raise AuthenticationError("Malformed bearer token")

        return self.authenticate_token(token)

    def require_scopes(
        self, principal: AuthenticatedPrincipal, required_scopes
    ) -> None:
        required = frozenset(required_scopes)
        missing = required - principal.scopes
        if missing:
            raise AuthenticationError("Insufficient token scopes")
