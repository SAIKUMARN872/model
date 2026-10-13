"""URL and navigation utilities."""

from __future__ import annotations

import ipaddress
import re
from urllib.parse import urlsplit, urlunsplit


def validate_url(url: str, *, allow_http: bool = True) -> str:
    """Validate a public HTTP(S) URL before browser navigation.

    This is application-level validation, not a substitute for network
    egress controls or protection against DNS rebinding.
    """
    if not isinstance(url, str) or not url.strip():
        raise ValueError("URL must be a non-empty string.")
    if len(url) > 4096 or any(ord(char) < 32 for char in url):
        raise ValueError("URL contains invalid characters or is too long.")
    if "\\" in url:
        raise ValueError("Backslashes are not allowed in URLs.")

    try:
        parts = urlsplit(url.strip())
        scheme = parts.scheme.lower()
        if scheme not in ({"https", "http"} if allow_http else {"https"}):
            raise ValueError("Only permitted HTTP(S) URLs are allowed.")
        if not parts.hostname or parts.username is not None or parts.password is not None:
            raise ValueError("URL must have a hostname and no embedded credentials.")
        if parts.port is not None and not 1 <= parts.port <= 65535:
            raise ValueError("Invalid URL port.")
    except (ValueError, UnicodeError) as exc:
        raise ValueError(f"Invalid URL: {exc}") from exc

    hostname = parts.hostname.rstrip(".").lower()
    if hostname == "localhost" or hostname.endswith(".localhost"):
        raise ValueError("Localhost destinations are not allowed.")

    try:
        address = ipaddress.ip_address(hostname.strip("[]"))
    except ValueError:
        address = None

    if address is not None and not address.is_global:
        raise ValueError("Private, reserved, and non-public IP addresses are blocked.")

    if not hostname or re.search(r"\s", hostname):
        raise ValueError("Invalid hostname.")

    return urlunsplit((scheme, parts.netloc, parts.path or "/", parts.query, parts.fragment))


def normalize_url(url: str) -> str:
    """Return a validated URL with a normalized scheme and path."""
    return validate_url(url)
