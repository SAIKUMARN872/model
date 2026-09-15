"""
Navigation helper utilities.
"""

from __future__ import annotations

from urllib.parse import (
    urljoin,
    urlparse,
)


def validate_url(
    url: str,
) -> str:

    if not isinstance(
        url,
        str,
    ):

        raise TypeError(
            "URL must be a string."
        )

    url = url.strip()

    if not url:

        raise ValueError(
            "URL cannot be empty."
        )

    parsed = urlparse(
        url
    )

    if parsed.scheme not in (
        "http",
        "https",
    ):

        raise ValueError(
            "Only HTTP and HTTPS URLs are supported."
        )

    if not parsed.netloc:

        raise ValueError(
            "URL must contain a hostname."
        )

    return url


def join_url(
    base_url: str,
    path: str,
) -> str:

    validate_url(
        base_url
    )

    return urljoin(
        base_url,
        path,
    )


def get_origin(
    url: str,
) -> str:

    parsed = urlparse(
        validate_url(url)
    )

    return (
        f"{parsed.scheme}://"
        f"{parsed.netloc}"
    )


def get_path(
    url: str,
) -> str:

    return urlparse(
        validate_url(url)
    ).path or "/"


def same_origin(
    url_a: str,
    url_b: str,
) -> bool:

    return (
        get_origin(url_a)
        == get_origin(url_b)
    )


def normalize_path(
    path: str,
) -> str:

    if not path:
        return "/"

    if not path.startswith("/"):
        path = "/" + path

    while "//" in path:
        path = path.replace(
            "//",
            "/",
        )

    return path