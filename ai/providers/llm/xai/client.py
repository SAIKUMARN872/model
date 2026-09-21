@'
import json
import urllib.error
import urllib.request
from typing import Any, Dict

from .config import XAIConfig
from .utils import is_retryable_status, json_dumps


class XAIClientError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int | None = None,
        response_body: str | None = None,
    ):
        super().__init__(message)
        self.status_code = status_code
        self.response_body = response_body


class XAIAuthenticationError(XAIClientError):
    pass


class XAIAuthorizationError(XAIClientError):
    pass


class XAIRateLimitError(XAIClientError):
    pass


class XAITimeoutError(XAIClientError):
    pass


class XAIUnavailableError(XAIClientError):
    pass


class XAIClient:
    def __init__(self, config: XAIConfig):
        self.config = config

    def _request(
        self,
        method: str,
        path: str,
        payload: Dict[str, Any] | None = None,
        accept: str = "application/json",
    ) -> Dict[str, Any] | str:

        if not self.config.api_key:
            raise XAIAuthenticationError(
                "XAI_API_KEY is not configured."
            )

        url = f"{self.config.base_url}{path}"

        headers = {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json",
            "Accept": accept,
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

                raw = response.read().decode("utf-8")

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

            if exc.code == 401:
                raise XAIAuthenticationError(
                    "xAI authentication failed.",
                    exc.code,
                    raw,
                )

            if exc.code == 403:
                raise XAIAuthorizationError(
                    "xAI authorization failed.",
                    exc.code,
                    raw,
                )

            if exc.code == 429:
                raise XAIRateLimitError(
                    "xAI rate limit exceeded.",
                    exc.code,
                    raw,
                )

            if is_retryable_status(exc.code):
                raise XAIUnavailableError(
                    f"xAI service returned HTTP {exc.code}.",
                    exc.code,
                    raw,
                )

            raise XAIClientError(
                f"xAI API error: HTTP {exc.code}.",
                exc.code,
                raw,
            )

        except urllib.error.URLError as exc:
            raise XAIUnavailableError(
                f"xAI network error: {exc.reason}"
            ) from exc

        except TimeoutError as exc:
            raise XAITimeoutError(
                "xAI request timed out."
            ) from exc

    def responses(
        self,
        payload: Dict[str, Any],
    ) -> Dict[str, Any]:

        result = self._request(
            "POST",
            "/v1/responses",
            payload,
        )

        if isinstance(result, str):
            return json.loads(result)

        return result

    def stream_responses(
        self,
        payload: Dict[str, Any],
    ) -> str:

        result = self._request(
            "POST",
            "/v1/responses",
            payload,
            accept="text/event-stream",
        )

        return str(result)

    def list_models(self) -> Dict[str, Any]:
        result = self._request(
            "GET",
            "/v1/models",
        )

        if isinstance(result, str):
            return json.loads(result)

        return result

    def health_check(self) -> bool:
        try:
            result = self.list_models()
            return isinstance(result, dict)

        except XAIClientError:
            return False
'@ | Set-Content .\ai\providers\llm\xai\client.py