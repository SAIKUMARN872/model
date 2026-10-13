from __future__ import annotations

from typing import Any

from ..exceptions import ComputerActionError


class VisualPerception:
    """Coordinate screen analysis and element detection for one screenshot."""

    def __init__(self, analyzer: Any = None, detector: Any = None) -> None:
        self._analyzer = analyzer
        self._detector = detector

    def perceive(self, screenshot: Any) -> dict[str, Any]:
        if screenshot is None:
            raise ValueError("screenshot must not be None")

        observation: dict[str, Any] = {
            "analysis": None,
            "elements": [],
            "analysis_available": self._analyzer is not None,
            "detection_available": self._detector is not None,
        }

        if self._analyzer is not None:
            operation = getattr(self._analyzer, "analyze", None)
            if not callable(operation):
                raise ComputerActionError("Analyzer must implement analyze(screenshot).")
            result = operation(screenshot)
            if not isinstance(result, dict):
                raise ComputerActionError("Analyzer must return a dictionary.")
            observation["analysis"] = dict(result)

        if self._detector is not None:
            operation = getattr(self._detector, "detect", None)
            if not callable(operation):
                raise ComputerActionError("Detector must implement detect(screenshot).")
            result = operation(screenshot)
            if not isinstance(result, list):
                raise ComputerActionError("Detector must return a list.")
            observation["elements"] = result

        return observation


ScreenPerception = VisualPerception
