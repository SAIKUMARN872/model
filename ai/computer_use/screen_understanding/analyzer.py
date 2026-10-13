from __future__ import annotations

from typing import Any

from ..exceptions import ComputerActionError


class ScreenAnalyzer:
    """Analyze a screenshot through an explicitly injected vision backend."""

    def __init__(self, backend: Any = None) -> None:
        self._backend = backend

    def analyze(self, screenshot: Any) -> dict[str, Any]:
        if screenshot is None:
            raise ValueError("screenshot must not be None")
        if self._backend is None:
            raise ComputerActionError(
                "Screen analysis requires an injected vision backend."
            )
        operation = getattr(self._backend, "analyze", None)
        if not callable(operation):
            raise ComputerActionError(
                "Vision backend must implement analyze(screenshot)."
            )
        try:
            result = operation(screenshot)
        except Exception as exc:
            raise ComputerActionError("Screen analysis failed.") from exc
        if not isinstance(result, dict):
            raise ComputerActionError(
                "Vision backend must return a dictionary."
            )
        return dict(result)


ScreenUnderstandingAnalyzer = ScreenAnalyzer
