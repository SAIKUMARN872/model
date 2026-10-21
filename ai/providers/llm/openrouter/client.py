from __future__ import annotations

import asyncio
import json
import time
from collections.abc import AsyncIterator, Iterator
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from .config import OpenRouterConfig


class OpenRouterClient:
    def __init__(
        self,
        config: OpenRouterConfig,
    ) -> None:
        self.config = config

    def _request_sync(
        self,
        url: str,
        *,
        method: str = "GET",
        payload: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        body = None

        if payload is not None:
            body = json.dumps(payload).encode("utf-8")

        request_headers = self.config.headers.copy()

        if headers:
            request_headers.update(headers)

        request = Request(
            url=url,
            data=body,
            headers=request_headers,
            method=method,
        )

        attempts = max(
            1,
            self.config.max_retries + 1
            if self.config.retry_enabled
            else 1,
        )

        last_error: Exception | None = None

        for attempt in range(attempts):
            try:
                with urlopen(
                    request,
                    timeout=self.config.timeout_seconds,
                ) as response:
                    raw = response.read().decode("utf-8")

                if not raw:
                    return {}

                return json.loads(raw)

            except HTTPError as exc:
                error_body = exc.read().decode(
                    "utf-8",
                    errors="replace",
                )

                last_error = RuntimeError(
                    f"OpenRouter HTTP {exc.code}: {error_body}"
                )

                if exc.code < 500 or attempt == attempts - 1:
                    raise last_error from exc

            except (URLError, TimeoutError) as exc:
                last_error = exc

                if attempt == attempts - 1:
                    raise

            if attempt < attempts - 1:
                time.sleep(min(2**attempt, 8))

        if last_error:
            raise last_error

        raise RuntimeError("OpenRouter request failed")

    async def request(
        self,
        url: str,
        *,
        method: str = "GET",
        payload: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        return await asyncio.to_thread(
            self._request_sync,
            url,
            method=method,
            payload=payload,
            headers=headers,
        )

    async def chat(
        self,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        return await self.request(
            self.config.chat_completions_url,
            method="POST",
            payload=payload,
        )

    async def list_models(self) -> dict[str, Any]:
        return await self.request(
            self.config.models_url,
            method="GET",
        )

    def _stream_sync(
        self,
        payload: dict[str, Any],
    ) -> Iterator[str]:
        request = Request(
            url=self.config.chat_completions_url,
            data=json.dumps(payload).encode("utf-8"),
            headers=self.config.headers,
            method="POST",
        )

        with urlopen(
            request,
            timeout=self.config.timeout_seconds,
        ) as response:
            for raw_line in response:
                yield raw_line.decode(
                    "utf-8",
                    errors="replace",
                ).rstrip("\r\n")

    async def stream(
        self,
        payload: dict[str, Any],
    ) -> AsyncIterator[str]:
        iterator = self._stream_sync(payload)

        while True:
            try:
                line = await asyncio.to_thread(next, iterator)
            except StopIteration:
                break

            yield line
