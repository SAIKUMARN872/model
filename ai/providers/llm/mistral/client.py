from __future__ import annotations

import json
import socket
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from .config import MistralConfig


class MistralClientError(Exception):
    """Base Mistral provider client error."""


class MistralAuthenticationError(MistralClientError):
    """Raised when Mistral authentication fails."""


class MistralRateLimitError(MistralClientError):
    """Raised when Mistral rate limits a request."""


class MistralUnavailableError(MistralClientError):
    """Raised when Mistral is temporarily unavailable."""


class MistralTimeoutError(MistralClientError):
    """Raised when a Mistral request times out."""


class MistralClient:
    """Low-level Mistral HTTP client for ModelNow."""

    def __init__(self, config: MistralConfig) -> None:
        self.config = config

    def _build_url(self, path: str) -> str:
        base_url = self.config.base_url.rstrip("/")
        normalized_path = path.lstrip("/")
        return f"{base_url}/{normalized_path}"

    def _request(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        *,
        stream: bool = False,
    ) -> dict[str, Any] | str | list[Any]:
        if not self.config.enabled:
            raise MistralClientError(
                "Mistral provider is disabled."
            )

        if not self.config.api_key:
            raise MistralAuthenticationError(
                "MISTRAL_API_KEY is not configured."
            )

        url = self._build_url(path)

        headers = {
            "Content-Type": "application/json",
            "Accept": (
                "text/event-stream"
                if stream
                else "application/json"
            ),
            "Authorization": f"Bearer {self.config.api_key}",
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

                if isinstance(decoded, (dict, list)):
                    return decoded

                return {}

        except urllib.error.HTTPError as exc:
            raw = exc.read().decode(
                "utf-8",
                errors="replace",
            )

            if exc.code in {401, 403}:
                raise MistralAuthenticationError(
                    f"Mistral authentication failed: "
                    f"HTTP {exc.code}: {raw}"
                ) from exc

            if exc.code == 429:
                raise MistralRateLimitError(
                    f"Mistral rate limit: HTTP 429: {raw}"
                ) from exc

            if exc.code in {408, 409} or exc.code >= 500:
                raise MistralUnavailableError(
                    f"Mistral unavailable: "
                    f"HTTP {exc.code}: {raw}"
                ) from exc

            raise MistralClientError(
                f"Mistral request failed: "
                f"HTTP {exc.code}: {raw}"
            ) from exc

        except urllib.error.URLError as exc:
            reason = getattr(exc, "reason", exc)

            if isinstance(
                reason,
                (TimeoutError, socket.timeout),
            ):
                raise MistralTimeoutError(
                    "Mistral request timed out."
                ) from exc

            raise MistralUnavailableError(
                f"Mistral connection failed: {reason}"
            ) from exc

        except (TimeoutError, socket.timeout) as exc:
            raise MistralTimeoutError(
                "Mistral request timed out."
            ) from exc

        except json.JSONDecodeError as exc:
            raise MistralClientError(
                "Mistral returned invalid JSON."
            ) from exc

    def chat_completions(
        self,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        result = self._request(
            "POST",
            "/v1/chat/completions",
            payload,
        )

        if isinstance(result, dict):
            return result

        if isinstance(result, str):
            decoded = json.loads(result)

            if isinstance(decoded, dict):
                return decoded

        raise MistralClientError(
            "Mistral chat completion returned "
            "an invalid response."
        )

    def stream_chat_completions(
        self,
        payload: dict[str, Any],
    ) -> str:
        result = self._request(
            "POST",
            "/v1/chat/completions",
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
            "/v1/models",
        )

        if isinstance(result, dict):
            return result

        if isinstance(result, str):
            decoded = json.loads(result)

            if isinstance(decoded, dict):
                return decoded

        raise MistralClientError(
            "Mistral model discovery returned "
            "an invalid response."
        )

    def health_check(self) -> bool:
        try:
            result = self.list_models()
            return isinstance(result, dict)
        except MistralClientError:
            return False


__all__ = [
    "MistralAuthenticationError",
    "MistralClient",
    "MistralClientError",
    "MistralRateLimitError",
    "MistralTimeoutError",
    "MistralUnavailableError",
]
