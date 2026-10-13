from __future__ import annotations

from typing import Any

from ..exceptions import ComputerActionError
from ..models import Screenshot
from .perception import VisualPerception


class VisualInterface:
    """Capture, analyze, and detect elements through injected components."""

    def __init__(
        self,
        *,
        screenshot_capture: Any,
        perception: VisualPerception | None = None,
    ) -> None:
        if screenshot_capture is None:
            raise ValueError("screenshot_capture is required")
        self._capture = screenshot_capture
        self._perception = perception or VisualPerception()

    def capture(self, path: str | None = None) -> Any:
        operation = getattr(self._capture, "capture", None)
        if not callable(operation):
            raise ComputerActionError("Screenshot provider must implement capture().")
        return operation(path) if path is not None else operation()

    def observe(
        self,
        *,
        screenshot: Any = None,
        screenshot_id: str = "visual-observation",
        screen_width: int | None = None,
        screen_height: int | None = None,
        path: str | None = None,
    ) -> dict[str, Any]:
        image = screenshot if screenshot is not None else self.capture(path)
        result = self._perception.perceive(image)
        result["screenshot"] = Screenshot(
            screenshot_id=screenshot_id,
            width=screen_width or 0,
            height=screen_height or 0,
            path=path,
            metadata={
                "dimensions_known": (
                    screen_width is not None and screen_height is not None
                )
            },
        )
        return result

    def analyze(self, screenshot: Any = None) -> dict[str, Any]:
        return self.observe(screenshot=screenshot)["analysis"] or {}

    def detect(self, screenshot: Any = None) -> list[dict[str, Any]]:
        return self.observe(screenshot=screenshot)["elements"]


ComputerVisualInterface = VisualInterface
