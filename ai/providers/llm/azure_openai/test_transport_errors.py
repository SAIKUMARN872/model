from __future__ import annotations

import asyncio

import httpx

from ai.providers.base.exceptions import (
    ProviderAuthenticationError,
    ProviderUnavailableError,
)
from ai.providers.llm.azure_openai import AzureOpenAIConfig
from ai.providers.llm.azure_openai.client import AzureOpenAIClient


async def make_client(
    handler,
) -> tuple[AzureOpenAIClient, httpx.AsyncClient]:
    config = AzureOpenAIConfig(
        endpoint="https://example.openai.azure.com",
        api_key="test-key",
        api_version="2025-04-01-preview",
        max_retries=1,
    )

    client = AzureOpenAIClient(config)
    http_client = httpx.AsyncClient(
        transport=httpx.MockTransport(handler),
        headers=config.headers,
    )
    client._http = http_client
    client._closed = False

    async def no_backoff(attempt: int) -> None:
        return None

    client._backoff = no_backoff
    return client, http_client


async def test_exhausted_connection_error() -> None:
    attempts = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal attempts
        attempts += 1
        raise httpx.ConnectError(
            "simulated connection failure",
            request=request,
        )

    client, http_client = await make_client(handler)

    try:
        try:
            await client.request("gpt-5", {"messages": []})
        except ProviderUnavailableError as exc:
            assert "transport error" in str(exc).lower()
            assert isinstance(exc.__cause__, httpx.ConnectError)
        else:
            raise AssertionError(
                "Expected ProviderUnavailableError."
            )

        assert attempts == 2
        print("EXHAUSTED CONNECTION ERROR IS RETRYABLE: PASS")
        print("ORIGINAL TRANSPORT CAUSE PRESERVED: PASS")
    finally:
        await http_client.aclose()


async def test_authentication_error_is_not_retried() -> None:
    attempts = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal attempts
        attempts += 1
        return httpx.Response(
            401,
            json={"error": {"message": "invalid test key"}},
            request=request,
        )

    client, http_client = await make_client(handler)

    try:
        try:
            await client.request("gpt-5", {"messages": []})
        except ProviderAuthenticationError:
            pass
        else:
            raise AssertionError(
                "Expected ProviderAuthenticationError."
            )

        assert attempts == 1
        print("AUTHENTICATION ERROR NOT RETRIED: PASS")
    finally:
        await http_client.aclose()


async def test_stream_connection_error_classification() -> None:
    attempts = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal attempts
        attempts += 1
        raise httpx.ConnectError(
            "simulated stream connection failure",
            request=request,
        )

    client, http_client = await make_client(handler)

    try:
        try:
            async for _ in client.stream("gpt-5", {"messages": []}):
                pass
        except ProviderUnavailableError as exc:
            assert isinstance(exc.__cause__, httpx.ConnectError)
        else:
            raise AssertionError(
                "Expected ProviderUnavailableError for streaming."
            )

        assert attempts == 1
        print("STREAM CONNECTION ERROR CLASSIFICATION: PASS")
    finally:
        await http_client.aclose()


async def main() -> None:
    await test_exhausted_connection_error()
    await test_authentication_error_is_not_retried()
    await test_stream_connection_error_classification()
    print("AZURE TRANSPORT ERROR REGRESSION TEST: PASS")


if __name__ == "__main__":
    asyncio.run(main())
