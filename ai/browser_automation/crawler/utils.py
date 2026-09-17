"""
Utilities for web crawling.
"""

from __future__ import annotations

import re
from urllib.parse import (
    urljoin,
    urldefrag,
    urlparse,
)


def normalize_url(
    url: str,
    base_url: str | None = None,
) -> str:
    """Normalize a URL."""

    if not isinstance(url, str):
        raise TypeError("URL must be a string.")

    url = url.strip()

    if not url:
        raise ValueError("URL cannot be empty.")

    if base_url:
        url = urljoin(base_url, url)

    url, _ = urldefrag(url)

    parsed = urlparse(url)

    if parsed.scheme not in (
        "http",
        "https",
    ):
        raise ValueError(
            f"Unsupported URL scheme: {parsed.scheme}"
        )

    return url


def get_domain(
    url: str,
) -> str:
    """Return hostname from URL."""

    parsed = urlparse(url)

    return (
        parsed.netloc
        .lower()
        .split(":")[0]
    )


def same_domain(
    url_a: str,
    url_b: str,
) -> bool:
    """Check whether two URLs belong to the same domain."""

    return (
        get_domain(url_a)
        == get_domain(url_b)
    )


def is_http_url(
    url: str,
) -> bool:

    try:

        parsed = urlparse(url)

        return parsed.scheme in (
            "http",
            "https",
        )

    except Exception:

        return False


def extract_links(
    html: str,
    base_url: str,
) -> list[str]:
    """
    Extract links from HTML.

    This lightweight implementation uses a regular
    expression and is intended as a fallback utility.
    For live pages, the extractor can use Playwright DOM APIs.
    """

    if not html:
        return []

    pattern = re.compile(
        r"""href\s*=\s*["']([^"']+)["']""",
        re.IGNORECASE,
    )

    links = []

    for href in pattern.findall(html):

        try:

            absolute = normalize_url(
                href,
                base_url,
            )

            if absolute not in links:
                links.append(absolute)

        except ValueError:
            continue

    return links


def filter_links(
    links: list[str],
    allowed_domains: set[str] | None = None,
    excluded_patterns: list[str] | None = None,
) -> list[str]:
    """Filter discovered links."""

    result = []

    patterns = [
        re.compile(pattern, re.IGNORECASE)
        for pattern in (
            excluded_patterns or []
        )
    ]

    for link in links:

        if not is_http_url(link):
            continue

        if (
            allowed_domains
            and get_domain(link)
            not in allowed_domains
        ):
            continue

        if any(
            pattern.search(link)
            for pattern in patterns
        ):
            continue

        if link not in result:
            result.append(link)

    return result