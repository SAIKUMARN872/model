from __future__ import annotations

from typing import Any

from ..exceptions import ComputerActionError
from ..models import UIElement
from .elements import normalize_elements


class UIElementDetector:
    """Normalize detections from an injected detector; never invent detections."""

    def __init__(
        self,
        backend: Any = None,
        *,
        screen_width: int | None = None,
        screen_height: int | None = None,
    ) -> None:
        self._backend = backend
        self._screen_width = screen_width
        self._screen_height = screen_height

    def detect(self, screenshot: Any) -> list[dict[str, Any]]:
        if screenshot is None:
            raise ValueError("screenshot must not be None")
        if self._backend is None:
            raise ComputerActionError(
                "UI detection requires an injected detector backend."
            )
        operation = getattr(self._backend, "detect", None)
        if not callable(operation):
            raise ComputerActionError(
                "Detector backend must implement detect(screenshot)."
            )
        try:
            raw = operation(screenshot)
            elements = normalize_elements(
                raw,
                screen_width=self._screen_width,
                screen_height=self._screen_height,
            )
        except ComputerActionError:
            raise
        except Exception as exc:
            raise ComputerActionError("UI element detection failed.") from exc

        return [
            {
                "element_id": item.element_id,
                "element_type": item.element_type,
                "label": item.label,
                "bounds": (
                    {
                        "x": item.bounds.x,
                        "y": item.bounds.y,
                        "width": item.bounds.width,
                        "height": item.bounds.height,
                    }
                    if item.bounds is not None else None
                ),
                "confidence": item.confidence,
                "interactable": item.interactable,
                "metadata": dict(item.metadata),
            }
            for item in elements
        ]

    def detect_elements(self, screenshot: Any) -> list[UIElement]:
        return normalize_elements(
            self.detect(screenshot),
            screen_width=self._screen_width,
            screen_height=self._screen_height,
        )


UIDetector = UIElementDetector
