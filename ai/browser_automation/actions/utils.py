"""
Utilities for browser automation actions.
"""

from __future__ import annotations

import asyncio
import re
from typing import Any, Awaitable, Callable


def validate_url(url: str) -> str:
    """Validate a browser URL."""

    if not isinstance(url, str):
        raise TypeError("URL must be a string.")

    url = url.strip()

    if not url:
        raise ValueError("URL cannot be empty.")

    if not re.match(
        r"^https?://",
        url,
        re.IGNORECASE,
    ):
        raise ValueError(
            "URL must start with http:// or https://"
        )

    return url


def validate_selector(
    selector: str,
) -> str:
    """Validate a CSS/text selector."""

    if not isinstance(selector, str):
        raise TypeError(
            "Selector must be a string."
        )

    selector = selector.strip()

    if not selector:
        raise ValueError(
            "Selector cannot be empty."
        )

    return selector


def validate_text(
    text: str,
) -> str:
    """Validate text input."""

    if not isinstance(text, str):
        raise TypeError(
            "Text must be a string."
        )

    text = text.strip()

    if not text:
        raise ValueError(
            "Text cannot be empty."
        )

    return text


async def retry_async(
    operation: Callable[
        [], Awaitable[Any]
    ],
    retries: int = 3,
    delay: float = 1.0,
) -> Any:
    """Retry an async browser operation."""

    if retries < 0:
        raise ValueError(
            "retries cannot be negative."
        )

    last_error: Exception | None = None

    for attempt in range(
        retries + 1
    ):
        try:
            return await operation()

        except Exception as exc:
            last_error = exc

            if attempt >= retries:
                break

            await asyncio.sleep(
                delay * (attempt + 1)
            )

    raise last_error or RuntimeError(
        "Operation failed."
    )


async def wait_for_page(
    page: Any,
    timeout: int = 30000,
) -> None:
    """Wait until the page reaches a stable load state."""

    await page.wait_for_load_state(
        "domcontentloaded",
        timeout=timeout,
    )


def safe_string(
    value: Any,
    default: str = "",
) -> str:
    """Safely convert a value to string."""

    if value is None:
        return default

    return str(value).strip()