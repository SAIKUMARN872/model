from __future__ import annotations

import json
import socket
import urllib.error
import urllib.request
from typing import Any

from .config import CohereConfig
from .utils import is_retryable_status, json_dumps


class CohereClientError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int | None = None,
        response_body: str | None = None,
    ):
        super().__init__(message)
        self.status_code = status_code
        self.response_body = response_body


class CohereAuthenticationError(CohereClientError):
    pass


class CohereRateLimitError(CohereClientError):
    pass


class CohereTimeoutError(CohereClientError):
    pass


class CohereUnavailableError(CohereClientError):
    pass


class CohereClient:
    def __init__(
        self,
        config: CohereConfig,
    ):
        self.config = config

    def _request(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        accept: str = "application/json",
    ) -> dict[str, Any] | str:
        if not self.config.enabled:
            raise CohereClientError(
                "Cohere provider is disabled."
            )

        if not self.config.api_key:
            raise CohereAuthenticationError(
                "COHERE_API_KEY is not configured."
            )

        url = f"{self.config.base_url}{path}"

        headers = {
            "Authorization": (
                f"Bearer {self.config.api_key}"
            ),
            "Content-Type": "application/json",
            "Accept": accept,
            "X-Client-Name": self.config.client_name,
        }

        body = (
            json_dumps(payload)
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
                raise CohereAuthenticationError(
                    "Cohere authentication failed.",
                    exc.code,
                    raw,
                ) from exc

            if exc.code == 429:
                raise CohereRateLimitError(
                    "Cohere rate limit exceeded.",
                    exc.code,
                    raw,
                ) from exc

            if is_retryable_status(exc.code):
                raise CohereUnavailableError(
                    f"Cohere service returned HTTP {exc.code}.",
                    exc.code,
                    raw,
                ) from exc

            raise CohereClientError(
                f"Cohere API error: HTTP {exc.code}.",
                exc.code,
                raw,
            ) from exc

        except urllib.error.URLError as exc:
            reason = getattr(exc, "reason", exc)

            if isinstance(
                reason,
                (TimeoutError, socket.timeout),
            ):
                raise CohereTimeoutError(
                    "Cohere request timed out."
                ) from exc

            raise CohereUnavailableError(
                f"Cohere network error: {reason}"
            ) from exc

        except (TimeoutError, socket.timeout) as exc:
            raise CohereTimeoutError(
                "Cohere request timed out."
            ) from exc

    def chat(
        self,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        result = self._request(
            "POST",
            "/v2/chat",
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
            "/v2/chat",
            payload,
            accept="text/event-stream",
        )

        return result if isinstance(result, str) else json.dumps(result)

    def list_models(
        self,
        page_size: int = 100,
    ) -> dict[str, Any]:
        result = self._request(
            "GET",
            f"/v1/models?page_size={page_size}",
        )

        if isinstance(result, str):
            return json.loads(result)

        return result

    def health_check(self) -> bool:
        try:
            result = self.list_models()
            return isinstance(result, dict)
        except CohereClientError:
            return False


__all__ = [
    "CohereClient",
    "CohereClientError",
    "CohereAuthenticationError",
    "CohereRateLimitError",
    "CohereTimeoutError",
    "CohereUnavailableError",
]
