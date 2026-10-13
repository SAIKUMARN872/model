from __future__ import annotations

from typing import Any

from ..exceptions import ComputerActionError


class MouseActions:
    """Mouse adapter. A backend can be injected for safe testing."""

    def __init__(self, backend: Any = None) -> None:
        self._backend = backend

    def _get_backend(self) -> Any:
        if self._backend is None:
            try:
                import pyautogui
            except ImportError as exc:
                raise ComputerActionError(
                    "Mouse control requires pyautogui. Install it explicitly "
                    "before enabling real desktop interaction."
                ) from exc
            self._backend = pyautogui
        return self._backend

    def move(self, x: int, y: int) -> Any:
        return self._call("moveTo", x, y)

    def click(self, x: int, y: int, button: str = "left") -> Any:
        if button not in {"left", "right", "middle"}:
            raise ValueError("Unsupported mouse button.")
        return self._call("click", x=x, y=y, button=button)

    def double_click(self, x: int, y: int) -> Any:
        return self._call("doubleClick", x=x, y=y, button="left")

    def right_click(self, x: int, y: int) -> Any:
        return self._call("rightClick", x=x, y=y)

    def drag(
        self, start_x: int, start_y: int, end_x: int, end_y: int,
        duration: float = 0.2,
    ) -> Any:
        if duration < 0:
            raise ValueError("duration cannot be negative.")
        backend = self._get_backend()
        backend.moveTo(start_x, start_y)
        return backend.dragTo(end_x, end_y, duration=duration)

    def scroll(self, amount: int, x: int | None = None,
               y: int | None = None) -> Any:
        if isinstance(amount, bool) or not isinstance(amount, int):
            raise TypeError("amount must be an integer.")
        kwargs = {}
        if x is not None:
            kwargs["x"] = x
        if y is not None:
            kwargs["y"] = y
        return self._get_backend().scroll(amount, **kwargs)

    def _call(self, method: str, *args: Any, **kwargs: Any) -> Any:
        backend = self._get_backend()
        operation = getattr(backend, method, None)
        if not callable(operation):
            raise ComputerActionError(
                f"Mouse backend does not support {method}."
            )
        return operation(*args, **kwargs)


MouseAdapter = MouseActions
