"""Bounded HTTP scraper with redirect validation."""

from urllib.error import HTTPError, URLError
from urllib.request import (
    HTTPRedirectHandler,
    Request,
    build_opener,
)

from .parser import parse_html
from .utils import validate_url


class ScraperError(RuntimeError):
    """Raised when a page cannot be safely fetched or parsed."""


class _SafeRedirectHandler(HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, new_url):
        try:
            safe_url = validate_url(new_url)
        except (ValueError, OSError) as exc:
            raise ScraperError(f"Unsafe redirect rejected: {exc}") from exc

        return super().redirect_request(
            request, response, code, message, headers, safe_url
        )


class Scraper:
    """Fetch and parse public HTML pages with configurable resource limits."""

    def __init__(
        self,
        timeout=10,
        max_bytes=2_000_000,
        user_agent="ModelNowScraper/1.0",
    ):
        if timeout <= 0:
            raise ValueError("timeout must be positive.")
        if max_bytes <= 0:
            raise ValueError("max_bytes must be positive.")

        self.timeout = timeout
        self.max_bytes = max_bytes
        self.user_agent = user_agent

    def scrape(self, url):
        """Return parsed HTML page data; raise ScraperError on failure."""
        try:
            safe_url = validate_url(url)
        except (ValueError, OSError) as exc:
            raise ScraperError(f"URL rejected: {exc}") from exc

        request = Request(
            safe_url,
            headers={
                "User-Agent": self.user_agent,
                "Accept": "text/html,application/xhtml+xml;q=0.9",
            },
            method="GET",
        )

        opener = build_opener(_SafeRedirectHandler())

        try:
            with opener.open(request, timeout=self.timeout) as response:
                final_url = validate_url(response.geturl())
                content_type = response.headers.get_content_type()

                if content_type not in ("text/html", "application/xhtml+xml"):
                    raise ScraperError(
                        f"Unsupported content type: {content_type}"
                    )

                declared_length = response.headers.get("Content-Length")
                if declared_length:
                    try:
                        if int(declared_length) > self.max_bytes:
                            raise ScraperError("Response exceeds the size limit.")
                    except ValueError:
                        raise ScraperError("Invalid Content-Length header.")

                body = response.read(self.max_bytes + 1)
                if len(body) > self.max_bytes:
                    raise ScraperError("Response exceeds the size limit.")

                charset = response.headers.get_content_charset() or "utf-8"
                html = body.decode(charset, errors="replace")

                result = parse_html(html, base_url=final_url)
                result["status"] = getattr(response, "status", 200)
                result["content_type"] = content_type
                return result

        except ScraperError:
            raise
        except HTTPError as exc:
            raise ScraperError(f"HTTP error: {exc.code}") from exc
        except (URLError, TimeoutError, OSError, ValueError) as exc:
            reason = getattr(exc, "reason", exc)
            if isinstance(reason, OSError) and getattr(reason, "winerror", None) == 11001:
                message = (
                    "DNS resolution failed. Check internet connectivity "
                    "and DNS settings, then retry."
                )
            else:
                message = f"Unable to scrape page: {reason}"
            raise ScraperError(message) from exc

    def scrape_many(self, urls):
        """Scrape URLs independently and return per-URL success/error results."""
        results = []

        for url in urls:
            try:
                results.append({
                    "success": True,
                    "result": self.scrape(url),
                })
            except ScraperError as exc:
                results.append({
                    "success": False,
                    "url": url,
                    "error": str(exc),
                })

        return results

