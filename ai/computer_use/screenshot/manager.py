from __future__ import annotations

from pathlib import Path
from typing import Any

from ..models import Screenshot
from ..utils import generate_id
from .capture import ScreenshotCapture


class ScreenshotManager:
    """Turn captured images into ModelNow Screenshot records."""

    def __init__(self, capture: ScreenshotCapture | None = None) -> None:
        self.capture_adapter = capture or ScreenshotCapture()
        self.last_image: Any = None

    def capture(self, path: str | Path | None = None,
                image_format: str = "png") -> Screenshot:
        if not isinstance(image_format, str) or not image_format.strip():
            raise ValueError("image_format must be a non-empty string.")
        image = self.capture_adapter.capture(path)
        width, height = getattr(image, "size", (None, None))
        if not isinstance(width, int) or not isinstance(height, int):
            raise ValueError("Captured image must expose integer dimensions.")
        if width <= 0 or height <= 0:
            raise ValueError("Captured image dimensions must be positive.")
        self.last_image = image
        return Screenshot(
            screenshot_id=generate_id("screenshot"),
            width=width,
            height=height,
            format=image_format.lower().lstrip("."),
            path=str(path) if path is not None else None,
            metadata={"capture_backend": type(self.capture_adapter).__name__},
        )

    def get_last_image(self) -> Any:
        return self.last_image
