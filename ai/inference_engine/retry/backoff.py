from __future__ import annotations

import asyncio

from .strategy import RetryStrategy


async def sleep_before_retry(
    strategy: RetryStrategy,
    attempt: int,
) -> None:
    delay = strategy.delay_for_attempt(attempt)

    if delay > 0:
        await asyncio.sleep(delay)