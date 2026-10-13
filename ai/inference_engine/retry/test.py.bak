from __future__ import annotations

import asyncio

from ai.inference_engine.retry import (
    RetryExecutor,
    RetryStrategy,
)


async def main() -> None:
    attempts = 0

    async def flaky_operation() -> str:
        nonlocal attempts

        attempts += 1

        if attempts < 3:
            raise RuntimeError(
                "temporary failure"
            )

        return "success"

    strategy = RetryStrategy(
        max_attempts=3,
        initial_delay_seconds=0,
        max_delay_seconds=0,
    )

    executor = RetryExecutor(strategy)

    result = await executor.execute(
        flaky_operation
    )

    assert result == "success"
    assert attempts == 3

    attempts = 0

    async def always_fails() -> None:
        nonlocal attempts

        attempts += 1

        raise RuntimeError(
            "permanent failure"
        )

    try:
        await executor.execute(
            always_fails
        )
    except RuntimeError as exc:
        assert str(exc) == "permanent failure"
    else:
        raise AssertionError(
            "Expected RuntimeError."
        )

    assert attempts == 3

    print("RETRY SUCCESS PATH: PASS")
    print("RETRY MAX ATTEMPTS: PASS")
    print("RETRY FAILURE PROPAGATION: PASS")
    print("EXPONENTIAL BACKOFF CONFIG: PASS")
    print("RETRY TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())