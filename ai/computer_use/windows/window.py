from __future__ import annotations

from typing import Any

from ..exceptions import ComputerActionError, WindowNotFoundError


class WindowAdapter:
    """Window discovery and focus through an injected platform backend."""

    def __init__(self, backend: Any) -> None:
        if backend is None:
            raise ValueError("A window backend is required.")
        self.backend = backend

    def find(self, title: str) -> Any:
        if not isinstance(title, str) or not title.strip():
            raise ValueError("window title must be a non-empty string.")
        operation = getattr(self.backend, "find", None)
        if not callable(operation):
            raise ComputerActionError("Window backend must provide find().")
        try:
            window = operation(title.strip())
        except Exception as exc:
            raise ComputerActionError("Window discovery failed.") from exc
        if window is None:
            raise WindowNotFoundError(f"Window '{title}' was not found.")
        return window

    def focus(self, window: Any) -> None:
        if window is None:
            raise ValueError("window cannot be None.")
        operation = getattr(self.backend, "focus", None)
        if not callable(operation):
            raise ComputerActionError("Window backend must provide focus().")
        try:
            operation(window)
        except Exception as exc:
            raise ComputerActionError("Could not focus the requested window.") from exc


WindowController = WindowAdapter
