"""Allowlisted HTTPS client for connector implementations."""

from __future__ import annotations

import json
from typing import Any, Mapping
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urljoin, urlsplit
from urllib.request import (
    HTTPRedirectHandler,
    Request,
    build_opener,
)

from .config import ConnectorConfig
from .exceptions import ConnectorRequestError


class _NoRedirectHandler(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class ConnectorHTTPClient:
    """Small JSON client. Hosts must be explicitly allowlisted."""

    def __init__(self, config: ConnectorConfig) -> None:
        if not isinstance(config, ConnectorConfig):
            raise TypeError("config must be ConnectorConfig.")
        if not config.base_url:
            raise ValueError("An HTTPS base_url is required.")
        if not config.allowed_hosts:
            raise ValueError("allowed_hosts must be explicitly configured.")
        self.config = config
        self._opener = build_opener(_NoRedirectHandler())

    def request(
        self,
        method: str,
        path: str,
        *,
        query: Mapping[str, Any] | None = None,
        json_body: Any = None,
        headers: Mapping[str, str] | None = None,
    ) -> Any:
        if not isinstance(method, str) or method.upper() not in {
            "GET", "POST", "PUT", "PATCH", "DELETE"
        }:
            raise ConnectorRequestError("Unsupported HTTP method.")

        if not isinstance(path, str) or not path or path.startswith("//"):
            raise ConnectorRequestError("A relative request path is required.")

        url = urljoin(self.config.base_url.rstrip("/") + "/", path.lstrip("/"))
        parsed = urlsplit(url)
        base = urlsplit(self.config.base_url)

        if (
            parsed.scheme != "https"
            or parsed.hostname not in {h.lower() for h in self.config.allowed_hosts}
            or parsed.hostname != base.hostname
            or parsed.username
            or parsed.password
        ):
            raise ConnectorRequestError("Request URL is not allowlisted.")

        if query:
            url += ("&" if "?" in url else "?") + urlencode(query, doseq=True)

        payload = None
        request_headers = {"Accept": "application/json"}
        if headers:
            for key, value in headers.items():
                if not isinstance(key, str) or not isinstance(value, str):
                    raise ConnectorRequestError("Headers must be strings.")
                if key.lower() in {"host", "content-length", "connection"}:
                    raise ConnectorRequestError("Restricted HTTP header.")
                request_headers[key] = value

        if json_body is not None:
            payload = json.dumps(json_body).encode("utf-8")
            request_headers["Content-Type"] = "application/json"

        request = Request(
            url,
            data=payload,
            headers=request_headers,
            method=method.upper(),
        )

        try:
            with self._opener.open(
                request, timeout=self.config.timeout_seconds
            ) as response:
                raw = response.read(2_000_001)
                if len(raw) > 2_000_000:
                    raise ConnectorRequestError("Response exceeds size limit.")
                if not raw:
                    return None
                try:
                    return json.loads(raw.decode("utf-8"))
                except (UnicodeDecodeError, json.JSONDecodeError):
                    raise ConnectorRequestError(
                        "Provider returned a non-JSON response."
                    ) from None
        except HTTPError as exc:
            raise ConnectorRequestError(
                f"Provider returned HTTP status {exc.code}."
            ) from None
        except URLError:
            raise ConnectorRequestError(
                "Provider request failed or timed out."
            ) from None
