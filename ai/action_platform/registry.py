from typing import Any, Protocol

from .core.models import ActionRequest


class ActionHandler(Protocol):
    async def execute(self, request: ActionRequest, context: Any = None) -> Any:
        ...


class ActionRegistry:
    """Maps each action domain to one executable handler."""

    def __init__(self) -> None:
        self._handlers: dict[str, ActionHandler] = {}

    def register(self, domain: str, handler: ActionHandler) -> None:
        key = getattr(domain, "value", domain)
        if not isinstance(key, str) or not key.strip():
            raise ValueError("A valid domain is required.")
        if not callable(getattr(handler, "execute", None)):
            raise TypeError("Handler must provide an execute method.")
        if key in self._handlers:
            raise ValueError(f"Handler already registered for domain: {key}")
        self._handlers[key] = handler

    def get(self, domain: str) -> ActionHandler | None:
        key = getattr(domain, "value", domain)
        return self._handlers.get(key)

    def domains(self) -> tuple[str, ...]:
        return tuple(sorted(self._handlers))
