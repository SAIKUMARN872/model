from __future__ import annotations

from typing import Any

from ..exceptions import ComputerInitializationError, ComputerUseError
from ..interfaces import ComputerInterface


class DesktopComputer(ComputerInterface):
    """Lifecycle wrapper around an explicitly injected desktop backend."""

    def __init__(self, backend: Any = None) -> None:
        self.backend = backend
        self._initialized = False

    @property
    def initialized(self) -> bool:
        return self._initialized

    def initialize(self) -> None:
        if self._initialized:
            return
        if self.backend is None:
            raise ComputerInitializationError(
                "An explicit desktop backend is required."
            )
        operation = getattr(self.backend, "initialize", None)
        if not callable(operation):
            raise ComputerInitializationError(
                "Desktop backend must provide initialize()."
            )
        try:
            operation()
            self._initialized = True
        except Exception as exc:
            raise ComputerInitializationError(
                "Desktop initialization failed."
            ) from exc

    def shutdown(self) -> None:
        if not self._initialized:
            return
        operation = getattr(self.backend, "shutdown", None)
        try:
            if callable(operation):
                operation()
        except Exception as exc:
            raise ComputerUseError("Desktop shutdown failed.") from exc
        finally:
            self._initialized = False

    def get_state(self) -> dict[str, Any]:
        if not self._initialized:
            raise ComputerUseError("Desktop is not initialized.")
        operation = getattr(self.backend, "get_state", None)
        if not callable(operation):
            raise ComputerUseError("Desktop backend must provide get_state().")
        try:
            state = operation()
        except Exception as exc:
            raise ComputerUseError("Could not read desktop state.") from exc
        if not isinstance(state, dict):
            raise ComputerUseError("Desktop backend state must be a dictionary.")
        return state


Desktop = DesktopComputer
