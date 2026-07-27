"""
Event Subscriber

Responsibilities
----------------
- Register Event Subscribers
- Manage Event Handlers
- Auto Registration
"""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Awaitable, Callable

from config.logging import log
from domain.events import DomainEvent
from events.publisher import publisher

# ==========================================================
# Type Alias
# ==========================================================

EventHandler = Callable[[DomainEvent], Awaitable[None]]


# ==========================================================
# Event Subscriber
# ==========================================================

class EventSubscriber:
    """
    Enterprise Event Subscriber
    """

    def __init__(self) -> None:

        self._handlers: dict[
            str,
            list[EventHandler]
        ] = defaultdict(list)

    # ======================================================
    # Register
    # ======================================================

    def register(
        self,
        event_name: str,
        handler: EventHandler,
    ) -> None:
        """
        Register an event handler.
        """

        if handler not in self._handlers[event_name]:

            self._handlers[event_name].append(
                handler
            )

            publisher.subscribe(
                event_name,
                handler,
            )

            log.info(
                f"Registered handler '{handler.__name__}' "
                f"for event '{event_name}'."
            )

    # ======================================================
    # Unregister
    # ======================================================

    def unregister(
        self,
        event_name: str,
        handler: EventHandler,
    ) -> None:
        """
        Remove an event handler.
        """

        handlers = self._handlers.get(event_name)

        if handlers and handler in handlers:

            handlers.remove(handler)

            publisher.unsubscribe(
                event_name,
                handler,
            )

            log.info(
                f"Unregistered handler '{handler.__name__}' "
                f"from event '{event_name}'."
            )

    # ======================================================
    # Register Multiple
    # ======================================================

    def register_many(
        self,
        registrations: dict[
            str,
            list[EventHandler],
        ],
    ) -> None:

        for event_name, handlers in registrations.items():

            for handler in handlers:

                self.register(
                    event_name,
                    handler,
                )

    # ======================================================
    # Get Handlers
    # ======================================================

    def handlers(
        self,
        event_name: str,
    ) -> list[EventHandler]:

        return self._handlers.get(
            event_name,
            [],
        )

    # ======================================================
    # Registered Events
    # ======================================================

    def events(
        self,
    ) -> list[str]:

        return list(
            self._handlers.keys()
        )

    # ======================================================
    # Clear
    # ======================================================

    def clear(self) -> None:

        for event_name, handlers in self._handlers.items():

            for handler in handlers:

                publisher.unsubscribe(
                    event_name,
                    handler,
                )

        self._handlers.clear()

        log.info(
            "All event subscribers cleared."
        )


# ==========================================================
# Default Event Handlers
# ==========================================================

async def log_event(
    event: DomainEvent,
) -> None:

    log.info(
        f"Event Received: {event.event_name}",
        payload=event.payload,
    )


async def audit_event(
    event: DomainEvent,
) -> None:

    log.info(
        f"Audit Event: {event.event_name}",
        aggregate=event.aggregate_id,
    )


# ==========================================================
# Singleton
# ==========================================================

subscriber = EventSubscriber()


# ==========================================================
# Auto Registration
# ==========================================================

subscriber.register(
    "user.created",
    log_event,
)

subscriber.register(
    "chat.created",
    log_event,
)

subscriber.register(
    "model.created",
    log_event,
)

subscriber.register(
    "user.created",
    audit_event,
)

subscriber.register(
    "chat.created",
    audit_event,
) 