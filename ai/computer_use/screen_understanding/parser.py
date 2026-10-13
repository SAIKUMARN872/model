from __future__ import annotations

from typing import Any


class ScreenObservationParser:
    """Validate structured observations produced by a vision backend."""

    def parse(self, observation: Any) -> dict[str, Any]:
        if not isinstance(observation, dict):
            raise ValueError("Screen observation must be a dictionary.")

        result = dict(observation)

        for field in ("summary", "screen_type", "application", "page_title"):
            value = result.get(field)
            if value is not None and not isinstance(value, str):
                raise ValueError(f"'{field}' must be a string.")

        if "visible_text" in result:
            visible_text = result["visible_text"]
            if not isinstance(visible_text, list) or not all(
                isinstance(item, str) for item in visible_text
            ):
                raise ValueError("'visible_text' must be a list of strings.")
            result["visible_text"] = list(visible_text)

        if "confidence" in result:
            confidence = result["confidence"]
            if (
                isinstance(confidence, bool)
                or not isinstance(confidence, (int, float))
                or not 0.0 <= confidence <= 1.0
            ):
                raise ValueError("'confidence' must be between 0 and 1.")
            result["confidence"] = float(confidence)

        return result


ScreenParser = ScreenObservationParser
