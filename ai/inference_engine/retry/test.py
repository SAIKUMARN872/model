from __future__ import annotations

import asyncio

from ai.inference_engine.retry import (
    RetryExecutor,
    RetryStrategy,
)
from ai.providers.base.exceptions import (
    ProviderConfigurationError,
    ProviderTimeoutError,
)


async def main() -> None:
    strategy = RetryStrategy(
        max_attempts=3,
        initial_delay_seconds=0,
        max_delay_seconds=0,
    )
    executor = RetryExecutor(strategy)

    attempts = 0

    async def flaky_operation() -> str:
        nonlocal attempts
        attempts += 1

        if attempts < 3:
            raise ConnectionError("temporary connection failure")

        return "success"

    result = await executor.execute(flaky_operation)

    assert result == "success"
    assert attempts == 3
    print("TRANSIENT FAILURE RETRY: PASS")

    attempts = 0

    async def always_fails() -> None:
        nonlocal attempts
        attempts += 1
        raise TimeoutError("temporary timeout")

    try:
        await executor.execute(always_fails)
    except TimeoutError as exc:
        assert str(exc) == "temporary timeout"
    else:
        raise AssertionError("Expected TimeoutError.")

    assert attempts == 3
    print("RETRY MAX ATTEMPTS: PASS")
    print("FINAL TRANSIENT ERROR PROPAGATION: PASS")

    attempts = 0

    async def permanent_failure() -> None:
        nonlocal attempts
        attempts += 1
        raise ValueError("invalid request")

    try:
        await executor.execute(permanent_failure)
    except ValueError as exc:
        assert str(exc) == "invalid request"
    else:
        raise AssertionError("Expected ValueError.")

    assert attempts == 1
    print("PERMANENT ERROR NOT RETRIED: PASS")

    attempts = 0

    async def configuration_failure() -> None:
        nonlocal attempts
        attempts += 1
        raise ProviderConfigurationError("missing configuration")

    try:
        await executor.execute(configuration_failure)
    except ProviderConfigurationError:
        pass
    else:
        raise AssertionError("Expected ProviderConfigurationError.")

    assert attempts == 1
    print("PROVIDER CONFIGURATION ERROR NOT RETRIED: PASS")

    attempts = 0

    async def provider_timeout() -> str:
        nonlocal attempts
        attempts += 1

        if attempts == 1:
            raise ProviderTimeoutError("provider timed out")

        return "recovered"

    result = await executor.execute(provider_timeout)

    assert result == "recovered"
    assert attempts == 2
    print("RETRYABLE PROVIDER ERROR: PASS")
    print("MODELNOW RETRY TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())
