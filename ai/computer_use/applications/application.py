from __future__ import annotations

from typing import Any

from ..exceptions import ApplicationNotFoundError, ComputerActionError


class ApplicationAdapter:
    """Thin application adapter; the injected backend owns OS-specific behavior."""

    def __init__(self, backend: Any) -> None:
        if backend is None:
            raise ValueError("An application backend is required.")
        self.backend = backend

    @staticmethod
    def _name(application: str) -> str:
        if not isinstance(application, str) or not application.strip():
            raise ValueError("application must be a non-empty string.")
        return application.strip()

    def launch(self, application: str) -> Any:
        name = self._name(application)
        operation = getattr(self.backend, "launch", None)
        if not callable(operation):
            raise ComputerActionError("Application backend must provide launch().")
        try:
            result = operation(name)
            if result is None:
                raise ApplicationNotFoundError(
                    f"Application backend could not launch '{name}'."
                )
            return result
        except ApplicationNotFoundError:
            raise
        except Exception as exc:
            raise ComputerActionError(
                f"Application launch failed for '{name}'."
            ) from exc

    def close(self, application: str) -> None:
        name = self._name(application)
        operation = getattr(self.backend, "close", None)
        if not callable(operation):
            raise ComputerActionError("Application backend must provide close().")
        try:
            operation(name)
        except Exception as exc:
            raise ComputerActionError(
                f"Application close failed for '{name}'."
            ) from exc


ApplicationController = ApplicationAdapter
