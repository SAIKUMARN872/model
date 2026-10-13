from __future__ import annotations

from pathlib import Path
from typing import Any

from ..exceptions import ScreenCaptureError


class ScreenshotCapture:
    """Capture an image using an injected backend or lazy pyautogui import."""

    def __init__(self, backend: Any = None) -> None:
        self._backend = backend

    def _get_backend(self) -> Any:
        if self._backend is None:
            try:
                import pyautogui
            except ImportError as exc:
                raise ScreenCaptureError(
                    "Screenshot capture requires pyautogui or an injected "
                    "capture backend."
                ) from exc
            self._backend = pyautogui
        return self._backend

    def capture(self, path: str | Path | None = None) -> Any:
        backend = self._get_backend()
        operation = getattr(backend, "screenshot", None)
        if not callable(operation):
            operation = getattr(backend, "capture", None)
        if not callable(operation):
            raise ScreenCaptureError(
                "Capture backend must provide screenshot() or capture()."
            )
        try:
            image = operation()
            if image is None:
                raise ScreenCaptureError("Capture backend returned no image.")
            if path is not None:
                image.save(str(path))
            return image
        except ScreenCaptureError:
            raise
        except Exception as exc:
            raise ScreenCaptureError("Screenshot capture failed.") from exc
