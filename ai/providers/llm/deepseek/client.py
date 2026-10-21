from __future__ import annotations

import json
import socket
import urllib.error
import urllib.request
from typing import Any

from .config import DeepSeekConfig


class DeepSeekClientError(Exception):
    """Base DeepSeek client error."""


class DeepSeekAuthenticationError(
    DeepSeekClientError
):
    """Raised when DeepSeek authentication fails."""


class DeepSeekRateLimitError(
    DeepSeekClientError
):
    """Raised when DeepSeek rate limits the request."""


class DeepSeekUnavailableError(
    DeepSeekClientError
):
    """Raised when DeepSeek is temporarily unavailable."""


class DeepSeekTimeoutError(
    DeepSeekClientError
):
    """Raised when a DeepSeek request times out."""


class DeepSeekClient:
    """Low-level DeepSeek HTTP client."""

    def __init__(
        self,
        config: DeepSeekConfig,
    ) -> None:
        self.config = config

    def _request(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        accept: str = "application/json",
    ) -> dict[str, Any] | str:
        if not self.config.enabled:
            raise DeepSeekClientError(
                "DeepSeek provider is disabled."
            )

        if not self.config.api_key:
            raise DeepSeekAuthenticationError(
                "DEEPSEEK_API_KEY is not configured."
            )

        url = (
            f"{self.config.base_url}"
            f"{path}"
        )

        headers = {
            "Authorization": (
                f"Bearer {self.config.api_key}"
            ),
            "Content-Type": "application/json",
            "Accept": accept,
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

                if accept == "text/event-stream":
                    return raw

                return json.loads(raw)

        except urllib.error.HTTPError as exc:
            raw = exc.read().decode(
                "utf-8",
                errors="replace",
            )

            if exc.code in {401, 403}:
                raise DeepSeekAuthenticationError(
                    f"DeepSeek authentication failed: "
                    f"HTTP {exc.code}: {raw}"
                ) from exc

            if exc.code == 429:
                raise DeepSeekRateLimitError(
                    f"DeepSeek rate limit: "
                    f"HTTP 429: {raw}"
                ) from exc

            if exc.code in {
                408,
                409,
            } or exc.code >= 500:
                raise DeepSeekUnavailableError(
                    f"DeepSeek unavailable: "
                    f"HTTP {exc.code}: {raw}"
                ) from exc

            raise DeepSeekClientError(
                f"DeepSeek request failed: "
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
                raise DeepSeekTimeoutError(
                    "DeepSeek request timed out."
                ) from exc

            raise DeepSeekUnavailableError(
                f"DeepSeek connection failed: {reason}"
            ) from exc

        except (
            TimeoutError,
            socket.timeout,
        ) as exc:
            raise DeepSeekTimeoutError(
                "DeepSeek request timed out."
            ) from exc

    def chat(
        self,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        result = self._request(
            "POST",
            "/chat/completions",
            payload,
        )

        if isinstance(result, str):
            return json.loads(result)

        return result

    def stream_chat(
        self,
        payload: dict[str, Any],
    ) -> str:
        result = self._request(
            "POST",
            "/chat/completions",
            payload,
            accept="text/event-stream",
        )

        if isinstance(result, str):
            return result

        return json.dumps(result)

    def list_models(
        self,
    ) -> dict[str, Any]:
        result = self._request(
            "GET",
            "/models",
        )

        if isinstance(result, str):
            return json.loads(result)

        return result

    def health_check(self) -> bool:
        try:
            result = self.list_models()
            return isinstance(
                result,
                dict,
            )
        except DeepSeekClientError:
            return False


__all__ = [
    "DeepSeekAuthenticationError",
    "DeepSeekClient",
    "DeepSeekClientError",
    "DeepSeekRateLimitError",
    "DeepSeekTimeoutError",
    "DeepSeekUnavailableError",
]
