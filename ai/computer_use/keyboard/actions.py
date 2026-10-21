from __future__ import annotations

from typing import Any

from ..exceptions import ComputerActionError


class KeyboardActions:
    """Keyboard adapter. A backend can be injected for safe testing."""

    def __init__(self, backend: Any = None) -> None:
        self._backend = backend

    def _get_backend(self) -> Any:
        if self._backend is None:
            try:
                import pyautogui
            except ImportError as exc:
                raise ComputerActionError(
                    "Keyboard control requires pyautogui. Install it "
                    "explicitly before enabling real desktop interaction."
                ) from exc
            self._backend = pyautogui
        return self._backend

    def type_text(self, text: str, interval: float = 0.0) -> Any:
        if not isinstance(text, str):
            raise TypeError("text must be a string.")
        if interval < 0:
            raise ValueError("interval cannot be negative.")
        return self._call("write", text, interval=interval)

    def press(self, key: str) -> Any:
        if not isinstance(key, str) or not key.strip():
            raise ValueError("key must be a non-empty string.")
        return self._call("press", key)

    def hotkey(self, *keys: str) -> Any:
        if not keys or any(not isinstance(k, str) or not k.strip() for k in keys):
            raise ValueError("Provide one or more non-empty hotkey names.")
        return self._call("hotkey", *keys)

    def _call(self, method: str, *args: Any, **kwargs: Any) -> Any:
        backend = self._get_backend()
        operation = getattr(backend, method, None)
        if not callable(operation):
            raise ComputerActionError(
                f"Keyboard backend does not support {method}."
            )
        return operation(*args, **kwargs)


KeyboardAdapter = KeyboardActions
