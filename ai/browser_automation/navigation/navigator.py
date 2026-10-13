"""Safe browser navigation wrapper."""

from __future__ import annotations

from typing import Any

from .utils import validate_url


class SafeNavigator:
    """Validate destinations before and after browser navigation.

    The page must be a Playwright-compatible page. Browser-level network
    egress restrictions are still required for production SSRF protection.
    """

    def __init__(self, *, allow_http: bool = True, timeout_ms: int = 30000):
        if isinstance(timeout_ms, bool) or not isinstance(timeout_ms, int) or timeout_ms < 1:
            raise ValueError("timeout_ms must be a positive integer.")
        self.allow_http = allow_http
        self.timeout_ms = timeout_ms

    async def navigate(self, page: Any, url: str) -> dict[str, Any]:
        if page is None or not callable(getattr(page, "goto", None)):
            raise TypeError("page must provide an async-compatible goto method.")

        safe_url = validate_url(url, allow_http=self.allow_http)
        response = await page.goto(
            safe_url,
            wait_until="domcontentloaded",
            timeout=self.timeout_ms,
        )

        final_url = getattr(page, "url", "")
        if not isinstance(final_url, str) or not final_url:
            raise RuntimeError("Browser did not provide a final URL.")

        try:
            validated_final_url = validate_url(final_url, allow_http=self.allow_http)
        except ValueError as exc:
            raise RuntimeError("Navigation ended at a blocked URL.") from exc

        status = getattr(response, "status", None) if response is not None else None
        return {
            "requested_url": safe_url,
            "final_url": validated_final_url,
            "http_status": status,
            "redirected": safe_url != validated_final_url,
        }
