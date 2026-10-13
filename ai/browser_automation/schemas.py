import ipaddress
from urllib.parse import urlsplit

from .constants import MAX_ACTIONS_PER_TASK, BrowserActionType
from .exceptions import InvalidBrowserTaskError, UnsafeUrlError
from .models import BrowserTask


_BLOCKED_HOSTS = {
    "localhost",
    "localhost.localdomain",
    "metadata.google.internal",
}


def validate_url(url: str) -> str:
    if not isinstance(url, str) or not url.strip():
        raise UnsafeUrlError("A non-empty URL is required.")

    url = url.strip()

    try:
        parsed = urlsplit(url)
        hostname = parsed.hostname
        scheme = parsed.scheme.lower()
        port = parsed.port
    except ValueError as exc:
        raise UnsafeUrlError("Malformed URL.") from exc

    if scheme not in {"http", "https"}:
        raise UnsafeUrlError("Only HTTP and HTTPS URLs are permitted.")

    if not hostname or parsed.username is not None or parsed.password is not None:
        raise UnsafeUrlError("URL host is missing or contains credentials.")

    if any(ord(char) < 32 for char in url):
        raise UnsafeUrlError("Control characters are not permitted in URLs.")

    hostname = hostname.rstrip(".").lower()

    if hostname in _BLOCKED_HOSTS or hostname.endswith(".localhost"):
        raise UnsafeUrlError("Localhost destinations are not permitted.")

    try:
        address = ipaddress.ip_address(hostname)
    except ValueError:
        address = None

    if address is not None and not address.is_global:
        raise UnsafeUrlError(
            "Private, local, and non-public IP addresses are blocked."
        )

    if port is not None and not 1 <= port <= 65535:
        raise UnsafeUrlError("Invalid destination port.")

    return url


def action_requires_approval(action) -> bool:
    if action.requires_approval:
        return True

    text = " ".join(
        str(value or "")
        for value in (
            action.description,
            action.selector,
            action.value,
        )
    ).lower()

    sensitive_terms = (
        "purchase",
        "buy now",
        "place order",
        "checkout",
        "pay now",
        "payment",
        "book now",
        "confirm booking",
        "submit order",
        "transfer money",
        "cancel booking",
    )

    return any(term in text for term in sensitive_terms)


def validate_task(task: BrowserTask) -> None:
    if not isinstance(task, BrowserTask):
        raise InvalidBrowserTaskError("task must be a BrowserTask.")

    if not isinstance(task.goal, str) or not task.goal.strip():
        raise InvalidBrowserTaskError("Task goal must not be empty.")

    if len(task.actions) > MAX_ACTIONS_PER_TASK:
        raise InvalidBrowserTaskError(
            f"A task may contain at most {MAX_ACTIONS_PER_TASK} actions."
        )

    if task.start_url:
        validate_url(task.start_url)

    allowed = set(BrowserActionType)

    for action in task.actions:
        if action.action_type not in allowed:
            raise InvalidBrowserTaskError("Unsupported browser action type.")

        if action.action_type == BrowserActionType.NAVIGATE:
            if not action.url:
                raise InvalidBrowserTaskError(
                    "Navigate action requires a URL."
                )
            validate_url(action.url)

        if action.action_type in {
            BrowserActionType.CLICK,
            BrowserActionType.FILL,
        }:
            if not isinstance(action.selector, str) or not action.selector.strip():
                raise InvalidBrowserTaskError(
                    f"{action.action_type.value} action requires a selector."
                )

        if action.action_type == BrowserActionType.FILL:
            if action.value is None:
                raise InvalidBrowserTaskError(
                    "Fill action requires a value."
                )
            if not isinstance(action.value, str):
                raise InvalidBrowserTaskError(
                    "Fill action value must be a string."
                )
