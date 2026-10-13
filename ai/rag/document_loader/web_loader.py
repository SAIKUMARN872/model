from __future__ import annotations

import ipaddress
import socket
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import (
    HTTPRedirectHandler,
    Request,
    build_opener,
)

from ai.rag.models import RAGDocument
from ai.rag.document_parser.html import parse_html
from ai.rag.document_parser.utils import require_text
from .utils import build_document_id

MAX_WEB_BYTES = 5 * 1024 * 1024
DEFAULT_TIMEOUT = 10


def _validate_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise ValueError("URL must use HTTP or HTTPS and include a hostname")
    if parsed.username or parsed.password:
        raise ValueError("URLs containing credentials are not supported")

    hostname = parsed.hostname.lower()
    if hostname == "localhost" or hostname.endswith(".localhost") or hostname.endswith(".local"):
        raise ValueError("Local network URLs are not allowed")

    try:
        addresses = {ipaddress.ip_address(hostname)}
    except ValueError:
        try:
            addresses = {
                ipaddress.ip_address(item[4][0])
                for item in socket.getaddrinfo(hostname, parsed.port or (443 if parsed.scheme == "https" else 80))
            }
        except OSError as exc:
            raise ValueError("Unable to resolve the URL hostname") from exc

    if not addresses or any(
        address.is_private or address.is_loopback or address.is_link_local
        or address.is_reserved or address.is_multicast or address.is_unspecified
        for address in addresses
    ):
        raise ValueError("Local or non-public network destinations are not allowed")

    return url


class _SafeRedirectHandler(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        _validate_url(urljoin(req.full_url, newurl))
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def load_web_page(
    url: str,
    *,
    timeout: float = DEFAULT_TIMEOUT,
    max_bytes: int = MAX_WEB_BYTES,
) -> RAGDocument:
    url = _validate_url(url)
    if timeout <= 0 or max_bytes <= 0:
        raise ValueError("timeout and max_bytes must be positive")

    request = Request(
        url,
        headers={"User-Agent": "ModelNow-RAG/1.0", "Accept": "text/html,text/plain;q=0.9"},
    )
    opener = build_opener(_SafeRedirectHandler())

    try:
        with opener.open(request, timeout=timeout) as response:
            final_url = _validate_url(response.geturl())
            content_type = response.headers.get_content_type()
            if content_type not in {"text/html", "text/plain", "application/xhtml+xml"}:
                raise ValueError(f"Unsupported web content type: {content_type}")

            declared_length = response.headers.get("Content-Length")
            if declared_length and int(declared_length) > max_bytes:
                raise ValueError("Web page exceeds the configured size limit")

            raw = response.read(max_bytes + 1)
            if len(raw) > max_bytes:
                raise ValueError("Web page exceeds the configured size limit")
            charset = response.headers.get_content_charset() or "utf-8"
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
        raise RuntimeError(f"Unable to fetch web page: {url}") from exc

    try:
        source_text = raw.decode(charset, errors="replace")
    except LookupError:
        source_text = raw.decode("utf-8", errors="replace")

    text = parse_html(source_text) if content_type != "text/plain" else require_text(source_text)
    text = require_text(text)
    return RAGDocument(
        document_id=build_document_id(final_url, text),
        text=text,
        metadata={
            "source": final_url,
            "filename": urlparse(final_url).path.rsplit("/", 1)[-1] or "web-page",
            "format": "web",
            "content_type": content_type,
            "size_bytes": len(raw),
        },
    )


load_url = load_web_page

__all__ = ["load_web_page", "load_url"]
