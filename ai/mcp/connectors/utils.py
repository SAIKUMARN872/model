"""Validation and normalization helpers for MCP connectors."""

from urllib.parse import urlsplit


def validate_name(name: str) -> str:
    if not isinstance(name, str) or not name.strip():
        raise ValueError("Connector name must be a non-empty string.")
    return name.strip()


def validate_http_url(url: str, allowed_hosts=None) -> str:
    """Validate HTTP(S) URLs and optionally restrict destination hostnames."""
    if not isinstance(url, str) or not url.strip():
        raise ValueError("URL must be a non-empty string.")

    parsed = urlsplit(url.strip())
    if parsed.scheme.casefold() not in {"http", "https"}:
        raise ValueError("Only HTTP and HTTPS URLs are supported.")
    if not parsed.hostname or parsed.username or parsed.password:
        raise ValueError("URL must contain a hostname and no embedded credentials.")
    try:
        parsed.port
    except ValueError as exc:
        raise ValueError("URL contains an invalid port.") from exc

    if allowed_hosts is not None:
        normalized = {
            str(host).strip().casefold().rstrip(".")
            for host in allowed_hosts
            if isinstance(host, str) and host.strip()
        }
        if parsed.hostname.casefold().rstrip(".") not in normalized:
            raise ValueError("URL host is not in the connector allowlist.")

    return url.strip()


def validate_positive_number(value, name: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be a positive number.")
    if value <= 0:
        raise ValueError(f"{name} must be a positive number.")
    return float(value)


def validate_max_bytes(value: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise ValueError("Maximum response size must be a positive integer.")
    return value