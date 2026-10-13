from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass
from threading import Lock


@dataclass
class RateLimitState:
    limit: int | None = None
    remaining: int | None = None
    reset_at: float | None = None
    retry_after: float | None = None
    updated_at: float | None = None

    def update(
        self,
        *,
        limit: int | None = None,
        remaining: int | None = None,
        reset_at: float | None = None,
        retry_after: float | None = None,
    ) -> None:
        if limit is not None:
            self.limit = limit
        if remaining is not None:
            self.remaining = remaining
        if reset_at is not None:
            self.reset_at = reset_at
        if retry_after is not None:
            self.retry_after = retry_after

        self.updated_at = time.time()

    @property
    def limited(self) -> bool:
        now = time.time()

        if self.retry_after is not None and self.retry_after > 0:
            return True

        if self.remaining is not None and self.remaining <= 0:
            if self.reset_at is None or self.reset_at > now:
                return True

        return False

    @property
    def seconds_until_reset(self) -> float:
        if self.reset_at is None:
            return 0.0

        return max(0.0, self.reset_at - time.time())


class RateLimiter:
    def __init__(
        self,
        *,
        requests_per_second: float | None = None,
    ) -> None:
        self.requests_per_second = (
            requests_per_second
            if requests_per_second and requests_per_second > 0
            else None
        )

        self.state = RateLimitState()
        self._lock = Lock()
        self._last_request_at = 0.0

    async def acquire(self) -> None:
        await self._enforce_local_limit()
        await self._enforce_server_limit()

    async def _enforce_local_limit(self) -> None:
        if not self.requests_per_second:
            return

        interval = 1.0 / self.requests_per_second

        while True:
            with self._lock:
                now = time.monotonic()
                elapsed = now - self._last_request_at

                if elapsed >= interval:
                    self._last_request_at = now
                    return

                wait_seconds = interval - elapsed

            await asyncio.sleep(wait_seconds)

    async def _enforce_server_limit(self) -> None:
        if not self.state.limited:
            return

        wait_seconds = max(
            self.state.retry_after or 0.0,
            self.state.seconds_until_reset,
        )

        if wait_seconds > 0:
            await asyncio.sleep(wait_seconds)

        self.state.retry_after = None

    def update_from_headers(
        self,
        headers: dict[str, str],
    ) -> None:
        normalized = {
            str(key).lower(): str(value).strip()
            for key, value in headers.items()
        }

        self.state.update(
            limit=_parse_int(
                normalized.get("x-ratelimit-limit")
            ),
            remaining=_parse_int(
                normalized.get("x-ratelimit-remaining")
            ),
            reset_at=_parse_float(
                normalized.get("x-ratelimit-reset")
            ),
            retry_after=_parse_float(
                normalized.get("retry-after")
            ),
        )

    def reset(self) -> None:
        with self._lock:
            self._last_request_at = 0.0

        self.state = RateLimitState()


def _parse_int(value: str | None) -> int | None:
    if value is None:
        return None

    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def _parse_float(value: str | None) -> float | None:
    if value is None:
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


__all__ = [
    "RateLimitState",
    "RateLimiter",
]
