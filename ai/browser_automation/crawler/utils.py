from __future__ import annotations

from urllib.parse import urldefrag, urljoin, urlsplit

from ..schemas import validate_url


def normalize_url(url: str) -> str:
    normalized = validate_url(url)
    normalized, _fragment = urldefrag(normalized)
    return normalized


def resolve_url(base_url: str, link: str) -> str | None:
    if not isinstance(link, str) or not link.strip():
        return None

    try:
        safe_base = validate_url(base_url)
        resolved = urljoin(safe_base, link.strip())

        if urlsplit(resolved).scheme.lower() not in {"http", "https"}:
            return None

        return normalize_url(resolved)
    except (ValueError, TypeError):
        return None


def same_origin(first_url: str, second_url: str) -> bool:
    first = urlsplit(validate_url(first_url))
    second = urlsplit(validate_url(second_url))

    def effective_port(parts):
        if parts.port is not None:
            return parts.port
        return 443 if parts.scheme == "https" else 80

    return (
        first.scheme == second.scheme
        and (first.hostname or "").lower() == (second.hostname or "").lower()
        and effective_port(first) == effective_port(second)
    )
