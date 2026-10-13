"""HTTPS webhook delivery with host allowlisting and optional HMAC signing."""
import hashlib
import hmac
import json
import urllib.error
import urllib.parse
import urllib.request

from ai.connectors.exceptions import ConnectorConfigurationError, ConnectorRequestError


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class WebhookClient:
    MAX_REQUEST_BYTES = 1_000_000
    MAX_RESPONSE_BYTES = 1_000_000

    def __init__(self, timeout_seconds=15.0):
        if isinstance(timeout_seconds, bool) or not isinstance(timeout_seconds, (int, float)) or not 0 < timeout_seconds <= 120:
            raise ConnectorConfigurationError("Invalid webhook timeout.")
        self.timeout_seconds = float(timeout_seconds)
        self._opener = urllib.request.build_opener(_NoRedirect())

    @staticmethod
    def validate_url(url, allowed_hosts):
        if not isinstance(url, str) or not url or len(url) > 2048:
            raise ConnectorConfigurationError("Invalid webhook URL.")
        parsed = urllib.parse.urlsplit(url)
        if (
            parsed.scheme != "https"
            or not parsed.hostname
            or parsed.username is not None
            or parsed.password is not None
            or parsed.query
            or parsed.fragment
            or parsed.port not in (None, 443)
            or parsed.hostname.lower().rstrip(".") not in {
                host.lower().rstrip(".") for host in allowed_hosts
            }
        ):
            raise ConnectorConfigurationError("Webhook URL must use HTTPS on an allowlisted host.")
        host = parsed.hostname.lower().rstrip(".")
        if host in {"localhost", "localhost.localdomain"} or host.endswith(".localhost") or host.endswith(".local"):
            raise ConnectorConfigurationError("Local webhook destinations are not allowed.")
        try:
            import ipaddress
            address = ipaddress.ip_address(host)
            if not address.is_global:
                raise ConnectorConfigurationError("Non-public webhook IPs are not allowed.")
        except ValueError:
            pass
        if any(part == ".." for part in parsed.path.split("/")):
            raise ConnectorConfigurationError("Webhook path traversal is not allowed.")
        return url

    def deliver(self, url, allowed_hosts, payload, *, signing_secret=None, headers=None):
        self.validate_url(url, allowed_hosts)
        try:
            body = json.dumps(
                payload, ensure_ascii=False, separators=(",", ":"), allow_nan=False
            ).encode("utf-8")
        except (TypeError, ValueError) as exc:
            raise ConnectorRequestError("Webhook payload must be valid JSON data.") from exc

        if len(body) > self.MAX_REQUEST_BYTES:
            raise ConnectorRequestError("Webhook payload exceeds the size limit.")

        request_headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if headers:
            for name, value in headers.items():
                if (
                    not isinstance(name, str)
                    or not isinstance(value, str)
                    or name.lower() in {"host", "content-length", "connection", "transfer-encoding"}
                    or any(ord(c) < 33 or ord(c) > 126 for c in name)
                    or "\r" in value or "\n" in value
                ):
                    raise ConnectorConfigurationError("Invalid webhook header.")
                request_headers[name] = value

        if signing_secret is not None:
            if not isinstance(signing_secret, str) or not signing_secret:
                raise ConnectorConfigurationError("Invalid webhook signing secret.")
            digest = hmac.new(signing_secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
            request_headers["X-ModelNow-Signature-256"] = "sha256=" + digest

        request = urllib.request.Request(url, data=body, headers=request_headers, method="POST")
        try:
            with self._opener.open(request, timeout=self.timeout_seconds) as response:
                raw = response.read(self.MAX_RESPONSE_BYTES + 1)
                if len(raw) > self.MAX_RESPONSE_BYTES:
                    raise ConnectorRequestError("Webhook response exceeds the size limit.")
                status = response.status
        except urllib.error.HTTPError as exc:
            # Do not include the response body or destination credentials in errors.
            raise ConnectorRequestError(f"Webhook endpoint returned HTTP {exc.code}.") from None
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            raise ConnectorRequestError("Webhook delivery failed.") from None

        if not 200 <= status < 300:
            raise ConnectorRequestError(f"Webhook endpoint returned HTTP {status}.")
        if not raw:
            return {"status_code": status, "body": None}
        try:
            data = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            data = {"text": raw.decode("utf-8", errors="replace")}
        return {"status_code": status, "body": data}
