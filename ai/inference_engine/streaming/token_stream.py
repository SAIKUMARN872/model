from __future__ import annotations

from collections.abc import AsyncIterator, Iterable


class TokenStream:
    """Provide an async stream of token/content chunks."""

    def __init__(
        self,
        tokens: Iterable[str],
    ) -> None:
        self._tokens = list(tokens)

    def __aiter__(self) -> AsyncIterator[str]:
        return self._iterate()

    async def _iterate(self) -> AsyncIterator[str]:
        for token in self._tokens:
            yield token


__all__ = ["TokenStream"]
