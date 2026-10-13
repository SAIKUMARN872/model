"""Bounded HTTP API connector for MCP integrations."""

import asyncio
import json
from dataclasses import dataclass
from typing import Mapping
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from .connector import MCPConnector, MCPConnectorError
from .utils import validate_http_url, validate_max_bytes, validate_positive_number


@dataclass(frozen=True)
class MCPAPIResponse:
    status_code: int
    headers: Mapping[str, str]
    body: bytes

    def json(self):
        return json.loads(self.body.decode("utf-8"))


class MCPAPIConnector(MCPConnector):
    """HTTP client requiring an explicit destination-host allowlist."""

    def __init__(
        self,
        name: str,
        *,
        allowed_hosts,
        timeout_seconds: float = 10.0,
        max_response_bytes: int = 1_000_000,
        default_headers: Mapping[str, str] | None = None,
    ) -> None:
        super().__init__(name)
        if not allowed_hosts:
            raise ValueError("An explicit allowed_hosts list is required.")
        self.allowed_hosts = frozenset(
            host.strip().casefold().rstrip(".")
            for host in allowed_hosts
            if isinstance(host, str) and host.strip()
        )
        if not self.allowed_hosts:
            raise ValueError("allowed_hosts must contain valid hostnames.")
        self.timeout_seconds = validate_positive_number(
            timeout_seconds, "timeout_seconds"
        )
        self.max_response_bytes = validate_max_bytes(max_response_bytes)
        self.default_headers = dict(default_headers or {})

        for key, value in self.default_headers.items():
            if not isinstance(key, str) or not isinstance(value, str):
                raise ValueError("HTTP header names and values must be strings.")
            if "\r" in key or "\n" in key or "\r" in value or "\n" in value:
                raise ValueError("HTTP headers cannot contain line breaks.")

    async def _connect(self) -> None:
        # urllib opens connections per request; no persistent socket is needed.
        return None

    async def _close(self) -> None:
        return None

    async def request(
        self,
        method: str,
        url: str,
        *,
        headers: Mapping[str, str] | None = None,
        json_body=None,
        body: bytes | None = None,
    ) -> MCPAPIResponse:
        self.require_connected()

        if not isinstance(method, str) or not method.strip():
            raise ValueError("HTTP method must be a non-empty string.")
        method = method.strip().upper()
        if method not in {"GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"}:
            raise ValueError("Unsupported HTTP method.")
        url = validate_http_url(url, self.allowed_hosts)

        if body is not None and json_body is not None:
            raise ValueError("Provide either body or json_body, not both.")
        if json_body is not None:
            body = json.dumps(json_body).encode("utf-8")

        request_headers = dict(self.default_headers)
        for key, value in (headers or {}).items():
            if not isinstance(key, str) or not isinstance(value, str):
                raise ValueError("HTTP header names and values must be strings.")
            if any(char in key + value for char in "\r\n"):
                raise ValueError("HTTP headers cannot contain line breaks.")
            request_headers[key] = value

        if json_body is not None and not any(
            key.casefold() == "content-type" for key in request_headers
        ):
            request_headers["Content-Type"] = "application/json"

        request = Request(
            url,
            data=body,
            headers=request_headers,
            method=method,
        )

        def perform_request():
            try:
                with urlopen(request, timeout=self.timeout_seconds) as response:
                    response_body = response.read(self.max_response_bytes + 1)
                    if len(response_body) > self.max_response_bytes:
                        raise MCPConnectorError("HTTP response exceeds size limit.")
                    return MCPAPIResponse(
                        status_code=response.status,
                        headers=dict(response.headers.items()),
                        body=response_body,
                    )
            except HTTPError as exc:
                # HTTP errors are valid HTTP responses, including their status.
                response_body = exc.read(self.max_response_bytes + 1)
                if len(response_body) > self.max_response_bytes:
                    raise MCPConnectorError(
                        "HTTP error response exceeds size limit."
                    ) from exc
                return MCPAPIResponse(
                    status_code=exc.code,
                    headers=dict(exc.headers.items()) if exc.headers else {},
                    body=response_body,
                )
            except (URLError, TimeoutError, OSError) as exc:
                raise MCPConnectorError(f"HTTP request failed: {exc}") from exc

        return await asyncio.to_thread(perform_request)