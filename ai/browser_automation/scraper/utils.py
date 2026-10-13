"""Text normalization and URL safety utilities."""

import ipaddress
import socket
from urllib.parse import urlsplit, urlunsplit


def normalize_text(value):
    """Normalize whitespace without changing the original meaning."""
    if value is None:
        return ""
    return " ".join(str(value).split())


def validate_url(url, *, resolve_host=True):
    """Validate an HTTP(S) URL and reject private or special-use destinations.

    DNS resolution is performed before fetching. For production deployments,
    enforce equivalent restrictions at the network/egress layer as well.
    """
    if not isinstance(url, str) or not url.strip():
        raise ValueError("URL must be a non-empty string.")

    url = url.strip()

    if any(ord(char) < 32 or ord(char) == 127 for char in url):
        raise ValueError("URL contains control characters.")

    try:
        parts = urlsplit(url)
        hostname = parts.hostname
        port = parts.port
    except ValueError as exc:
        raise ValueError("Malformed URL.") from exc

    if parts.scheme.lower() not in ("http", "https"):
        raise ValueError("Only HTTP and HTTPS URLs are supported.")

    if not hostname:
        raise ValueError("URL must contain a hostname.")

    if parts.username is not None or parts.password is not None:
        raise ValueError("URLs containing credentials are not allowed.")

    if port is not None and not 1 <= port <= 65535:
        raise ValueError("Invalid URL port.")

    hostname = hostname.rstrip(".").lower()

    if hostname == "localhost" or hostname.endswith(".localhost"):
        raise ValueError("Localhost destinations are not allowed.")

    if hostname.endswith(".local") or hostname.endswith(".internal"):
        raise ValueError("Local or internal hostnames are not allowed.")

    def check_ip(address):
        ip = ipaddress.ip_address(address)
        if not ip.is_global:
            raise ValueError("Private or special-use IP addresses are not allowed.")

    try:
        check_ip(hostname)
        addresses = [hostname]
    except ValueError as exc:
        # A syntactically valid IP that is not globally routable must fail.
        try:
            ipaddress.ip_address(hostname)
        except ValueError:
            addresses = None
        else:
            raise exc

    if addresses is None and resolve_host:
        try:
            records = socket.getaddrinfo(
                hostname,
                port or (443 if parts.scheme.lower() == "https" else 80),
                type=socket.SOCK_STREAM,
            )
        except OSError as exc:
            raise ValueError("Hostname could not be resolved.") from exc

        addresses = list({record[4][0] for record in records})

        if not addresses:
            raise ValueError("Hostname has no usable addresses.")

        for address in addresses:
            check_ip(address)

    netloc = hostname
    if port is not None:
        netloc = f"{hostname}:{port}"

    return urlunsplit((
        parts.scheme.lower(),
        netloc,
        parts.path or "/",
        parts.query,
        "",
    ))
