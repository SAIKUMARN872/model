"""
Core interfaces/protocols for the AI platform.

The interfaces allow agents, tools, planners and providers
to be swapped without tightly coupling the system.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, AsyncIterator, Protocol


class AIProvider(ABC):
    """Base interface for an AI/LLM provider."""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        **kwargs: Any,
    ) -> str:
        """Generate a response."""
        raise NotImplementedError

    async def stream(
        self,
        prompt: str,
        **kwargs: Any,
    ) -> AsyncIterator[str]:

        result = await self.generate(
            prompt,
            **kwargs,
        )

        yield result


class Agent(ABC):
    """Base interface for AI agents."""

    @abstractmethod
    async def run(
        self,
        input_data: Any,
        **kwargs: Any,
    ) -> Any:
        """Execute the agent."""
        raise NotImplementedError


class Tool(ABC):
    """Base interface for executable tools."""

    @property
    @abstractmethod
    def name(self) -> str:
        raise NotImplementedError

    @abstractmethod
    async def execute(
        self,
        **kwargs: Any,
    ) -> Any:
        raise NotImplementedError


class PlannerInterface(ABC):
    """Base planner interface."""

    @abstractmethod
    async def plan(
        self,
        goal: str,
        **kwargs: Any,
    ) -> Any:
        raise NotImplementedError


class MemoryInterface(ABC):
    """Base memory interface."""

    @abstractmethod
    async def store(
        self,
        key: str,
        value: Any,
    ) -> None:
        raise NotImplementedError

    @abstractmethod
    async def retrieve(
        self,
        key: str,
        default: Any = None,
    ) -> Any:
        raise NotImplementedError


class BrowserInterface(Protocol):
    """Expected interface for browser implementations."""

    async def launch(
        self,
        **kwargs: Any,
    ) -> Any:
        ...

    async def goto(
        self,
        url: str,
        **kwargs: Any,
    ) -> Any:
        ...

    async def close(
        self,
    ) -> Any:
        ...


class EmbeddingProvider(Protocol):
    """Interface for embedding providers."""

    async def embed(
        self,
        text: str,
        **kwargs: Any,
    ) -> list[float]:
        ...

    async def embed_many(
        self,
        texts: list[str],
        **kwargs: Any,
    ) -> list[list[float]]:
        ...