"""Safe HTTP transport for configured GraphQL endpoints."""
import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

from ai.connectors.exceptions import ConnectorConfigurationError, ConnectorRequestError


class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class GraphQLClient:
    def __init__(self, endpoint_url: str, allowed_hosts: tuple[str, ...], timeout_seconds: float = 15.0):
        parsed = urlsplit(endpoint_url)
        if (
            parsed.scheme != "https"
            or not parsed.hostname
            or parsed.username
            or parsed.password
            or parsed.query
            or parsed.fragment
            or parsed.hostname.lower() not in {h.lower() for h in allowed_hosts}
        ):
            raise ConnectorConfigurationError(
                "GraphQL endpoint must be HTTPS and use an explicitly allowed host."
            )
        if not 0 < timeout_seconds <= 120:
            raise ConnectorConfigurationError("Invalid GraphQL timeout.")
        self.endpoint_url = endpoint_url
        self.allowed_hosts = frozenset(h.lower() for h in allowed_hosts)
        self.timeout_seconds = timeout_seconds
        self._opener = build_opener(_NoRedirect())

    def execute(self, query: str, variables: dict, *, access_token: str | None = None):
        payload = json.dumps({"query": query, "variables": variables}).encode("utf-8")
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"
        request = Request(self.endpoint_url, data=payload, headers=headers, method="POST")
        try:
            with self._opener.open(request, timeout=self.timeout_seconds) as response:
                if response.geturl() != self.endpoint_url:
                    raise ConnectorRequestError("GraphQL endpoint redirect rejected.")
                raw = response.read(2_000_001)
                if len(raw) > 2_000_000:
                    raise ConnectorRequestError("GraphQL response exceeds size limit.")
                result = json.loads(raw.decode("utf-8"))
        except HTTPError as exc:
            raise ConnectorRequestError(f"GraphQL HTTP request failed with status {exc.code}.") from None
        except (URLError, TimeoutError, OSError):
            raise ConnectorRequestError("GraphQL network request failed.") from None
        except (UnicodeDecodeError, json.JSONDecodeError):
            raise ConnectorRequestError("GraphQL returned an invalid JSON response.") from None

        if not isinstance(result, dict):
            raise ConnectorRequestError("GraphQL response must be a JSON object.")
        if result.get("errors"):
            # Avoid exposing arbitrary upstream error text or sensitive variables.
            raise ConnectorRequestError("GraphQL operation returned errors.")
        return result
