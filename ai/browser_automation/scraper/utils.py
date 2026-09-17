"""
Utilities for browser scraping.
"""

from __future__ import annotations

import re
from urllib.parse import (
    urldefrag,
    urljoin,
    urlparse,
)


ALLOWED_SCHEMES = {
    "http",
    "https",
}


def normalize_url(
    url: str,
    base_url: str | None = None,
) -> str:
    """Normalize and validate a URL."""

    if not isinstance(url, str):
        raise TypeError(
            "URL must be a string."
        )

    url = url.strip()

    if not url:
        raise ValueError(
            "URL cannot be empty."
        )

    if base_url:
        url = urljoin(
            base_url,
            url,
        )

    url, _ = urldefrag(url)

    parsed = urlparse(url)

    if parsed.scheme.lower() not in ALLOWED_SCHEMES:
        raise ValueError(
            "Only HTTP and HTTPS URLs are supported."
        )

    if not parsed.netloc:
        raise ValueError(
            "URL must contain a hostname."
        )

    return url


def get_domain(
    url: str,
) -> str:

    parsed = urlparse(
        normalize_url(url)
    )

    return parsed.hostname.lower()


def same_domain(
    url_a: str,
    url_b: str,
) -> bool:

    return (
        get_domain(url_a)
        == get_domain(url_b)
    )


def clean_text(
    text: str | None,
) -> str:

    if not text:
        return ""

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


def remove_scripts(
    html: str,
) -> str:

    if not html:
        return ""

    html = re.sub(
        r"<script\b[^>]*>.*?</script>",
        "",
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )

    html = re.sub(
        r"<style\b[^>]*>.*?</style>",
        "",
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )

    return html


def absolute_url(
    link: str,
    base_url: str,
) -> str:

    return normalize_url(
        link,
        base_url,
    )


def is_valid_url(
    url: str,
) -> bool:

    try:

        normalize_url(url)

        return True

    except (
        TypeError,
        ValueError,
    ):

        return False


def unique_items(
    items: list[str],
) -> list[str]:

    seen: set[str] = set()

    result: list[str] = []

    for item in items:

        if item not in seen:

            seen.add(item)

            result.append(item)

    return result