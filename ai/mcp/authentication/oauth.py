"""OAuth response helpers.

These helpers format and validate OAuth-related data. They do not perform
provider authorization, exchange codes, or refresh tokens over a network.
"""
from typing import Any


def token_response(
    access_token: str,
    *,
    expires_in: int,
    scopes=(),
    token_type: str = "Bearer",
    refresh_token: str | None = None,
) -> dict[str, Any]:
    if not isinstance(access_token, str) or not access_token:
        raise ValueError("access_token is required")
    if isinstance(expires_in, bool) or not isinstance(expires_in, int):
        raise TypeError("expires_in must be an integer")
    if expires_in <= 0:
        raise ValueError("expires_in must be positive")
    if token_type.lower() != "bearer":
        raise ValueError("Only Bearer token responses are supported")

    result = {
        "access_token": access_token,
        "token_type": "Bearer",
        "expires_in": expires_in,
    }
    if scopes:
        if isinstance(scopes, str):
            result["scope"] = scopes
        else:
            result["scope"] = " ".join(sorted(set(scopes)))
    if refresh_token is not None:
        if not isinstance(refresh_token, str) or not refresh_token:
            raise ValueError("refresh_token must be non-empty when supplied")
        result["refresh_token"] = refresh_token
    return result


def parse_bearer_header(value: str | None) -> str | None:
    if not isinstance(value, str):
        return None
    scheme, separator, token = value.partition(" ")
    if not separator or scheme.lower() != "bearer" or not token:
        return None
    if token != token.strip() or any(ch.isspace() for ch in token):
        return None
    return token
