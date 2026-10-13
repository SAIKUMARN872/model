from __future__ import annotations

import json
import socket
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from .config import GoogleConfig


class GoogleClientError(Exception):
    """Base Google provider client error."""


class GoogleAuthenticationError(GoogleClientError):
    """Raised when Google authentication fails."""


class GoogleRateLimitError(GoogleClientError):
    """Raised when Google rate limits the request."""


class GoogleUnavailableError(GoogleClientError):
    """Raised when Google is temporarily unavailable."""


class GoogleTimeoutError(GoogleClientError):
    """Raised when a Google request times out."""


class GoogleClient:
    """Low-level Google Gemini HTTP client for ModelNow."""

    def __init__(
        self,
        config: GoogleConfig,
    ) -> None:
        self.config = config

    def _build_url(
        self,
        path: str,
        *,
        stream: bool = False,
    ) -> str:
        base_url = self.config.base_url.rstrip("/")
        normalized_path = path.lstrip("/")

        url = f"{base_url}/{normalized_path}"

        if self.config.api_key:
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}key={urllib.parse.quote(self.config.api_key)}"

        if stream:
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}alt=sse"

        return url

    def _request(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        *,
        stream: bool = False,
    ) -> dict[str, Any] | str | list[Any]:
        if not self.config.enabled:
            raise GoogleClientError(
                "Google provider is disabled."
            )

        if not self.config.api_key:
            raise GoogleAuthenticationError(
                "GOOGLE_API_KEY or GEMINI_API_KEY is not configured."
            )

        url = self._build_url(
            path,
            stream=stream,
        )

        headers = {
            "Content-Type": "application/json",
            "Accept": (
                "text/event-stream"
                if stream
                else "application/json"
            ),
            "User-Agent": self.config.client_name,
        }

        body = (
            json.dumps(
                payload,
                ensure_ascii=False,
                separators=(",", ":"),
            ).encode("utf-8")
            if payload is not None
            else None
        )

        request = urllib.request.Request(
            url=url,
            data=body,
            headers=headers,
            method=method,
        )

        try:
            with urllib.request.urlopen(
                request,
                timeout=self.config.timeout_seconds,
            ) as response:
                raw = response.read().decode(
                    "utf-8",
                    errors="replace",
                )

                if not raw:
                    return {}

                if stream:
                    return raw

                decoded = json.loads(raw)

                if isinstance(
                    decoded,
                    (dict, list),
                ):
                    return decoded

                return {}

        except urllib.error.HTTPError as exc:
            raw = exc.read().decode(
                "utf-8",
                errors="replace",
            )

            if exc.code in {400, 404}:
                raise GoogleClientError(
                    f"Google request failed: HTTP {exc.code}: {raw}"
                ) from exc

            if exc.code in {401, 403}:
                raise GoogleAuthenticationError(
                    f"Google authentication failed: "
                    f"HTTP {exc.code}: {raw}"
                ) from exc

            if exc.code == 429:
                raise GoogleRateLimitError(
                    f"Google rate limit: HTTP 429: {raw}"
                ) from exc

            if exc.code in {408, 409} or exc.code >= 500:
                raise GoogleUnavailableError(
                    f"Google unavailable: "
                    f"HTTP {exc.code}: {raw}"
                ) from exc

            raise GoogleClientError(
                f"Google request failed: "
                f"HTTP {exc.code}: {raw}"
            ) from exc

        except urllib.error.URLError as exc:
            reason = getattr(
                exc,
                "reason",
                exc,
            )

            if isinstance(
                reason,
                (
                    TimeoutError,
                    socket.timeout,
                ),
            ):
                raise GoogleTimeoutError(
                    "Google request timed out."
                ) from exc

            raise GoogleUnavailableError(
                f"Google connection failed: {reason}"
            ) from exc

        except (
            TimeoutError,
            socket.timeout,
        ) as exc:
            raise GoogleTimeoutError(
                "Google request timed out."
            ) from exc

        except json.JSONDecodeError as exc:
            raise GoogleClientError(
                "Google returned invalid JSON."
            ) from exc

    def generate_content(
        self,
        model: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        result = self._request(
            "POST",
            f"/v1beta/models/{model}:generateContent",
            payload,
        )

        if isinstance(result, dict):
            return result

        if isinstance(result, str):
            decoded = json.loads(result)

            if isinstance(decoded, dict):
                return decoded

        raise GoogleClientError(
            "Google generateContent returned an invalid response."
        )

    def stream_generate_content(
        self,
        model: str,
        payload: dict[str, Any],
    ) -> str:
        result = self._request(
            "POST",
            f"/v1beta/models/{model}:streamGenerateContent",
            payload,
            stream=True,
        )

        if isinstance(result, str):
            return result

        return json.dumps(
            result,
            ensure_ascii=False,
        )

    def list_models(self) -> dict[str, Any]:
        result = self._request(
            "GET",
            "/v1beta/models",
        )

        if isinstance(result, dict):
            return result

        if isinstance(result, str):
            decoded = json.loads(result)

            if isinstance(decoded, dict):
                return decoded

        raise GoogleClientError(
            "Google model discovery returned an invalid response."
        )

    def health_check(self) -> bool:
        try:
            result = self.list_models()
            return isinstance(result, dict)
        except GoogleClientError:
            return False


__all__ = [
    "GoogleAuthenticationError",
    "GoogleClient",
    "GoogleClientError",
    "GoogleRateLimitError",
    "GoogleTimeoutError",
    "GoogleUnavailableError",
]
