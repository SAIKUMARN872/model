@'
from __future__ import annotations

import json as jsonlib
from typing import Any

from ai.providers.base import (
    BaseClient,
    ProviderAuthenticationError,
    ProviderAuthorizationError,
    ProviderConfig,
    ProviderConfigurationError,
    ProviderError,
    ProviderModelNotFoundError,
    ProviderRateLimitError,
    ProviderResponseError,
    ProviderTimeoutError,
    ProviderUnavailableError,
    RateLimiter,
    RetryManager,
    RetryPolicy,
)

from .config import AzureOpenAIConfig


class AzureOpenAIClient(BaseClient):
    name = "azure_openai"

    def __init__(
        self,
        config: ProviderConfig,
        azure_config: AzureOpenAIConfig,
    ) -> None:
        super().__init__(config)

        self.azure_config = azure_config
        self._http_client: Any | None = None

        self.retry_manager = RetryManager(
            RetryPolicy(
                max_attempts=max(1, config.max_retries),
            )
        )

        self.rate_limiter = RateLimiter()

    async def initialize(self) -> None:
        if self._http_client is not None:
            return

        try:
            import httpx
        except ImportError as exc:
            raise ProviderConfigurationError(
                "httpx is required for the Azure OpenAI provider. "
                "Install it with: pip install httpx",
                provider=self.name,
                retryable=False,
            ) from exc

        timeout = httpx.Timeout(
            timeout=self.azure_config.timeout_seconds,
            connect=min(
                self.azure_config.timeout_seconds,
                10.0,
            ),
        )

        self._http_client = httpx.AsyncClient(
            base_url=self.azure_config.base_url,
            headers=self.azure_config.headers(),
            timeout=timeout,
        )

        self._initialized = True

    def _extract_request_id(
        self,
        response: Any,
    ) -> str | None:
        headers = getattr(response, "headers", {})

        return (
            headers.get("x-request-id")
            or headers.get("x-ms-request-id")
            or headers.get("request-id")
        )

    def _extract_retry_after(
        self,
        response: Any,
    ) -> float | None:
        headers = getattr(response, "headers", {})

        value = headers.get("retry-after")

        if value is None:
            return None

        try:
            parsed = float(value)

            if parsed >= 0:
                return parsed

        except (TypeError, ValueError):
            pass

        return None

    def _response_details(
        self,
        response: Any,
    ) -> dict[str, Any]:
        details: dict[str, Any] = {}

        request_id = self._extract_request_id(response)

        if request_id:
            details["request_id"] = request_id

        retry_after = self._extract_retry_after(response)

        if retry_after is not None:
            details["retry_after_seconds"] = retry_after

        try:
            payload = response.json()

            if isinstance(payload, dict):
                details["response"] = payload

        except Exception:
            text = getattr(response, "text", "")

            if text:
                details["response_text"] = text[:4000]

        return details

    def _raise_for_status(
        self,
        response: Any,
    ) -> None:
        status_code = int(response.status_code)

        if status_code < 400:
            return

        request_id = self._extract_request_id(response)
        retry_after = self._extract_retry_after(response)
        details = self._response_details(response)

        try:
            payload = response.json()

            if isinstance(payload, dict):
                error_payload = payload.get("error")

                if isinstance(error_payload, dict):
                    message = str(
                        error_payload.get(
                            "message",
                            "Azure OpenAI request failed.",
                        )
                    )

                    if error_payload.get("code"):
                        details["azure_code"] = (
                            error_payload["code"]
                        )

                else:
                    message = str(
                        payload.get(
                            "message",
                            "Azure OpenAI request failed.",
                        )
                    )
            else:
                message = (
                    response.text
                    or "Azure OpenAI request failed."
                )

        except Exception:
            message = (
                getattr(response, "text", None)
                or "Azure OpenAI request failed."
            )

        common = {
            "provider": self.name,
            "status_code": status_code,
            "request_id": request_id,
            "details": details,
        }

        if status_code == 401:
            raise ProviderAuthenticationError(
                message,
                retryable=False,
                **common,
            )

        if status_code == 403:
            raise ProviderAuthorizationError(
                message,
                retryable=False,
                **common,
            )

        if status_code == 404:
            raise ProviderModelNotFoundError(
                message,
                retryable=False,
                **common,
            )

        if status_code == 408:
            raise ProviderTimeoutError(
                message,
                retryable=True,
                **common,
            )

        if status_code == 409:
            raise ProviderError(
                message,
                retryable=True,
                **common,
            )

        if status_code == 429:
            raise ProviderRateLimitError(
                message,
                retry_after=retry_after,
                provider=self.name,
                status_code=status_code,
                request_id=request_id,
                retryable=True,
                details=details,
            )

        if 500 <= status_code <= 599:
            raise ProviderUnavailableError(
                message,
                retryable=True,
                **common,
            )

        if 400 <= status_code <= 499:
            raise ProviderResponseError(
                message,
                retryable=False,
                **common,
            )

        raise ProviderResponseError(
            message,
            retryable=False,
            **common,
        )

    async def _request_once(
        self,
        *,
        method: str,
        path: str,
        headers: dict[str, str] | None,
        json: dict[str, Any] | None,
        params: dict[str, Any] | None,
    ) -> Any:
        if self._http_client is None:
            raise ProviderConfigurationError(
                "Azure OpenAI HTTP client is not initialized.",
                provider=self.name,
                retryable=False,
            )

        await self.rate_limiter.acquire()

        try:
            response = await self._http_client.request(
                method=method,
                url=path,
                headers=headers,
                json=json,
                params=params,
            )

        except TimeoutError as exc:
            raise ProviderTimeoutError(
                "Azure OpenAI request timed out.",
                provider=self.name,
                retryable=True,
            ) from exc

        except Exception as exc:
            error_name = type(exc).__name__

            if error_name in {
                "ConnectError",
                "ConnectTimeout",
                "ReadTimeout",
                "WriteTimeout",
                "PoolTimeout",
            }:
                raise ProviderUnavailableError(
                    f"Azure OpenAI network error: {exc}",
                    provider=self.name,
                    retryable=True,
                ) from exc

            raise ProviderError(
                f"Azure OpenAI request failed: {exc}",
                provider=self.name,
                retryable=False,
            ) from exc

        response_headers = dict(
            getattr(response, "headers", {})
        )

        self.rate_limiter.update_from_headers(
            response_headers
        )

        self._raise_for_status(response)

        if not response.content:
            return None

        content_type = (
            response.headers.get(
                "content-type",
                "",
            ).lower()
        )

        if "application/json" in content_type:
            return response.json()

        try:
            return jsonlib.loads(response.text)

        except (TypeError, ValueError):
            return response.text

    async def request(
        self,
        *,
        method: str,
        path: str,
        headers: dict[str, str] | None = None,
        json: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> Any:
        await self.initialize()

        if not self.config.retry_enabled:
            return await self._request_once(
                method=method,
                path=path,
                headers=headers,
                json=json,
                params=params,
            )

        return await self.retry_manager.execute(
            lambda: self._request_once(
                method=method,
                path=path,
                headers=headers,
                json=json,
                params=params,
            )
        )

    async def close(self) -> None:
        if self._http_client is not None:
            await self._http_client.aclose()

            self._http_client = None

        self._initialized = False


__all__ = ["AzureOpenAIClient"]
'@ | Set-Content ".\ai\providers\llm\azure_openai\client.py"