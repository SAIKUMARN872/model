"""
Domain Event Publisher

Responsibilities
----------------
- Register Event Handlers
- Publish Events
- Async Event Dispatch
- Event Logging
"""

from __future__ import annotations

import asyncio
from collections import defaultdict
from collections.abc import Awaitable, Callable
from typing import Any

from domain.events import DomainEvent
from config.logging import log

# Type alias
EventHandler = Callable[[DomainEvent], Awaitable[None]]


class EventPublisher:
    """
    Enterprise Event Publisher
    """

    def __init__(self) -> None:
        self._subscribers: dict[str, list[EventHandler]] = defaultdict(list)

    # =====================================================
    # Subscribe
    # =====================================================

    def subscribe(
        self,
        event_name: str,
        handler: EventHandler,
    ) -> None:
        """
        Register an async handler for an event.
        """

        if handler not in self._subscribers[event_name]:
            self._subscribers[event_name].append(handler)

            log.info(
                "Event subscriber registered.",
                event=event_name,
            )

    # =====================================================
    # Unsubscribe
    # =====================================================

    def unsubscribe(
        self,
        event_name: str,
        handler: EventHandler,
    ) -> None:
        """
        Remove an event handler.
        """

        handlers = self._subscribers.get(event_name)

        if handlers and handler in handlers:
            handlers.remove(handler)

    # =====================================================
    # Publish
    # =====================================================

    async def publish(
        self,
        event: DomainEvent,
    ) -> None:
        """
        Publish an event.
        """

        handlers = self._subscribers.get(
            event.event_name,
            [],
        )

        if not handlers:

            log.warning(
                "No handlers registered.",
                event=event.event_name,
            )

            return

        await asyncio.gather(
            *[
                handler(event)
                for handler in handlers
            ],
            return_exceptions=False,
        )

        log.info(
            "Event published.",
            event=event.event_name,
        )

    # =====================================================
    # Publish Many
    # =====================================================

    async def publish_many(
        self,
        events: list[DomainEvent],
    ) -> None:
        """
        Publish multiple events.
        """

        for event in events:
            await self.publish(event)

    # =====================================================
    # Clear Subscribers
    # =====================================================

    def clear(self) -> None:
        """
        Remove all subscribers.
        """

        self._subscribers.clear()

    # =====================================================
    # Count Subscribers
    # =====================================================

    def subscriber_count(
        self,
        event_name: str,
    ) -> int:

        return len(
            self._subscribers.get(event_name, [])
        )

    # =====================================================
    # Registered Events
    # =====================================================

    def registered_events(self) -> list[str]:

        return list(
            self._subscribers.keys()
        )


# ==========================================================
# Singleton
# ==========================================================

publisher = EventPublisher() 