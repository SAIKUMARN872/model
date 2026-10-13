from __future__ import annotations

from http.cookiejar import Cookie
from typing import Any
from urllib.parse import urlsplit


def validate_cookie_data(cookie: Any) -> dict[str, Any]:
    if isinstance(cookie, Cookie):
        data = {
            "name": cookie.name,
            "value": cookie.value,
            "domain": cookie.domain,
            "path": cookie.path or "/",
            "secure": bool(cookie.secure),
            "httpOnly": False,
            "sameSite": None,
            "expires": cookie.expires,
        }
    elif isinstance(cookie, dict):
        data = dict(cookie)
    else:
        raise ValueError("Cookie must be a dictionary or Cookie object.")

    name = data.get("name")
    value = data.get("value")
    domain = data.get("domain")

    if not isinstance(name, str) or not name.strip():
        raise ValueError("Cookie name is required.")

    if any(ord(char) < 33 or ord(char) > 126 or char in '()<>@,;:\\\\"/[]?={}\\t' for char in name):
        raise ValueError("Cookie name contains invalid characters.")

    if not isinstance(value, str):
        raise ValueError("Cookie value must be a string.")

    if any(ord(char) < 32 or ord(char) == 127 for char in value):
        raise ValueError("Cookie value contains control characters.")

    if not isinstance(domain, str) or not domain.strip():
        raise ValueError("Cookie domain is required.")

    domain = domain.strip().lower().lstrip(".")

    if domain == "localhost" or domain.endswith(".localhost"):
        raise ValueError("Localhost cookies are not permitted.")

    if "/" in domain or "@" in domain or ":" in domain:
        raise ValueError("Invalid cookie domain.")

    try:
        parsed_domain = urlsplit("https://" + domain).hostname
    except ValueError as exc:
        raise ValueError("Invalid cookie domain.") from exc

    if not parsed_domain or parsed_domain != domain:
        raise ValueError("Invalid cookie domain.")

    path = data.get("path", "/")
    if not isinstance(path, str) or not path.startswith("/"):
        raise ValueError("Cookie path must begin with '/'.")

    secure = data.get("secure", False)
    http_only = data.get("httpOnly", data.get("http_only", False))

    if not isinstance(secure, bool) or not isinstance(http_only, bool):
        raise ValueError("Cookie security flags must be booleans.")

    same_site = data.get("sameSite", data.get("same_site"))
    if same_site is not None:
        if not isinstance(same_site, str):
            raise ValueError("SameSite must be Strict, Lax, or None.")
        same_site = same_site.capitalize()
        if same_site not in {"Strict", "Lax", "None"}:
            raise ValueError("SameSite must be Strict, Lax, or None.")

    expires = data.get("expires")
    if expires is not None and (
        isinstance(expires, bool) or not isinstance(expires, (int, float))
    ):
        raise ValueError("Cookie expiry must be a numeric timestamp or None.")

    return {
        **data,
        "name": name,
        "value": value,
        "domain": domain,
        "path": path,
        "secure": secure,
        "httpOnly": http_only,
        "sameSite": same_site,
        "expires": expires,
    }
