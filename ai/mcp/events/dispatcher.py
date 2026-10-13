"""Asynchronous MCP event dispatcher."""

import asyncio
import inspect
from dataclasses import dataclass
from typing import Any, Callable

from .events import MCPEvent
from .listener import MCPEventListener


@dataclass(frozen=True)
class MCPEventDispatchResult:
    event: MCPEvent
    delivered: int
    failures: tuple[tuple[str, str], ...]

    @property
    def success(self) -> bool:
        return not self.failures


class MCPEventDispatcher:
    """Dispatch events to matching sync or async listeners."""

    def __init__(self) -> None:
        self._listeners: dict[str, MCPEventListener] = {}
        self._lock = asyncio.Lock()

    async def subscribe(
        self,
        event_name: str | None,
        handler: Callable[..., Any],
    ) -> str:
        listener = MCPEventListener(
            handler=handler,
            event_name=event_name,
        )
        async with self._lock:
            self._listeners[listener.listener_id] = listener
        return listener.listener_id

    async def add_listener(self, listener: MCPEventListener) -> str:
        if not isinstance(listener, MCPEventListener):
            raise TypeError("listener must be an MCPEventListener.")

        async with self._lock:
            if listener.listener_id in self._listeners:
                raise ValueError(
                    f"Listener already registered: {listener.listener_id}"
                )
            self._listeners[listener.listener_id] = listener

        return listener.listener_id

    async def unsubscribe(self, listener_id: str) -> bool:
        if not isinstance(listener_id, str) or not listener_id.strip():
            raise ValueError("Listener ID must be a non-empty string.")

        async with self._lock:
            return self._listeners.pop(listener_id, None) is not None

    async def remove_listener(self, listener_id: str) -> bool:
        return await self.unsubscribe(listener_id)

    async def list_listeners(self) -> tuple[MCPEventListener, ...]:
        async with self._lock:
            return tuple(self._listeners.values())

    async def dispatch(self, event: MCPEvent) -> MCPEventDispatchResult:
        if not isinstance(event, MCPEvent):
            raise TypeError("event must be an MCPEvent.")

        async with self._lock:
            targets = tuple(
                listener
                for listener in self._listeners.values()
                if listener.event_name is None
                or listener.event_name == event.name
            )

        async def invoke(
            listener: MCPEventListener,
        ) -> tuple[str, str | None]:
            try:
                result = listener.handler(event)
                if inspect.isawaitable(result):
                    await result
                return listener.listener_id, None
            except Exception as exc:
                return (
                    listener.listener_id,
                    f"{type(exc).__name__}: {exc}",
                )

        outcomes = await asyncio.gather(
            *(invoke(listener) for listener in targets)
        )
        failures = tuple(
            (listener_id, error)
            for listener_id, error in outcomes
            if error is not None
        )

        return MCPEventDispatchResult(
            event=event,
            delivered=len(outcomes) - len(failures),
            failures=failures,
        )

    async def publish(
        self,
        event_name: str,
        payload: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> MCPEventDispatchResult:
        event = MCPEvent(
            name=event_name,
            payload={} if payload is None else payload,
            metadata={} if metadata is None else metadata,
        )
        return await self.dispatch(event)