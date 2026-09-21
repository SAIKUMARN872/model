from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from typing import Any, Mapping

from .config import ProviderConfig
from .response import StreamChunk


class BaseClient(ABC):
    """
    ModelNow provider transport abstraction.

    Concrete providers implement their HTTP transport through
    this interface. Provider-specific authentication, endpoints,
    and response parsing remain inside the provider adapter.
    """

    def __init__(self, config: ProviderConfig) -> None:
        self.config = config
        self._closed = False

    @property
    def closed(self) -> bool:
        return self._closed

    @abstractmethod
    async def request(
        self,
        *,
        method: str,
        path: str,
        headers: Mapping[str, str] | None = None,
        json: Any = None,
        params: Mapping[str, str] | None = None,
    ) -> Any:
        """
        Execute a provider transport request.

        Concrete clients implement HTTP/network behavior here.
        """
        raise NotImplementedError

    async def stream(
        self,
        *,
        method: str,
        path: str,
        headers: Mapping[str, str] | None = None,
        json: Any = None,
        params: Mapping[str, str] | None = None,
    ) -> AsyncIterator[StreamChunk]:
        """
        Stream provider responses.

        Concrete clients should override this when streaming
        transport is supported.
        """
        raise NotImplementedError(
            "Streaming is not implemented by this client."
        )
        yield

    async def close(self) -> None:
        """Release transport resources."""
        self._closed = True

    async def __aenter__(self) -> "BaseClient":
        return self

    async def __aexit__(
        self,
        exc_type,
        exc_value,
        traceback,
    ) -> None:
        await self.close()

