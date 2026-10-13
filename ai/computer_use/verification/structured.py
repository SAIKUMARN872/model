from __future__ import annotations

import re
from typing import Any


class StructuredEvidenceVerifier:
    """Verify expected outcomes against structured screen observations.

    This class does not perform OCR or image recognition. It evaluates
    text and UI labels supplied by a perception backend.
    """

    MIN_CONFIDENCE = 0.5

    _TEXT_FIELDS = (
        "summary",
        "visible_text",
        "page_title",
        "application",
        "screen_type",
    )

    _EXPECTED_KEYS = {
        "text_contains",
        "summary_contains",
        "page_title_contains",
        "application_equals",
        "screen_type_equals",
        "element_label_visible",
    }

    _NEGATION = re.compile(
        r"\b(?:not|no|never|failed|unavailable|unable to|"
        r"could not|did not|didn't)\s+(?:[\w'-]+\s+){0,3}$",
        re.IGNORECASE,
    )

    @staticmethod
    def _normalize(value: str) -> str:
        return " ".join(value.casefold().split())

    @classmethod
    def _phrase_state(cls, phrase: str, text: str) -> tuple[bool, bool]:
        """Return (positive_match, negated_match)."""
        target = cls._normalize(phrase)
        source = cls._normalize(text)
        if not target or not source:
            return False, False

        pattern = re.compile(
            r"(?<!\w)" + re.escape(target) + r"(?!\w)"
        )
        positive = False
        negated = False

        for match in pattern.finditer(source):
            prefix = source[max(0, match.start() - 50):match.start()]
            if cls._NEGATION.search(prefix):
                negated = True
            else:
                positive = True

        return positive, negated

    @classmethod
    def _extract(cls, actual: Any) -> tuple[dict[str, Any], list[str]] | None:
        if not isinstance(actual, dict):
            return None

        analysis_available = actual.get("analysis_available")
        detection_available = actual.get("detection_available")

        if type(analysis_available) is not bool or type(detection_available) is not bool:
            return None
        if not analysis_available and not detection_available:
            return None

        analysis = actual.get("analysis")
        elements = actual.get("elements")

        if analysis_available and not isinstance(analysis, dict):
            return None
        if detection_available and not isinstance(elements, list):
            return None

        analysis = analysis if isinstance(analysis, dict) else {}
        elements = elements if isinstance(elements, list) else []

        confidence = analysis.get("confidence")
        if confidence is not None:
            if (
                isinstance(confidence, bool)
                or not isinstance(confidence, (int, float))
                or not 0.0 <= confidence <= 1.0
                or confidence < cls.MIN_CONFIDENCE
            ):
                return None

        for field in cls._TEXT_FIELDS:
            value = analysis.get(field)
            if field == "visible_text":
                if value is not None and (
                    not isinstance(value, list)
                    or any(not isinstance(item, str) for item in value)
                ):
                    return None
            elif value is not None and not isinstance(value, str):
                return None

        texts: list[str] = []
        for field in ("summary", "page_title", "application", "screen_type"):
            value = analysis.get(field)
            if isinstance(value, str) and value.strip():
                texts.append(value)

        visible_text = analysis.get("visible_text", [])
        if isinstance(visible_text, list):
            texts.extend(item for item in visible_text if item.strip())

        labels: list[str] = []
        for element in elements:
            if isinstance(element, dict):
                label = element.get("label")
            else:
                label = getattr(element, "label", None)

            if label is not None and not isinstance(label, str):
                return None
            if isinstance(label, str) and label.strip():
                labels.append(label)

        return analysis, texts + labels

    def verify(self, expected: Any, actual: Any) -> bool:
        extracted = self._extract(actual)
        if extracted is None:
            return False

        analysis, all_texts = extracted
        labels = [
            item.get("label") if isinstance(item, dict)
            else getattr(item, "label", None)
            for item in actual.get("elements", [])
        ]
        labels = [
            item for item in labels
            if isinstance(item, str) and item.strip()
        ]

        if isinstance(expected, str):
            if not expected.strip():
                return False
            states = [self._phrase_state(expected, text) for text in all_texts]
            # Contradictory evidence is treated conservatively.
            if any(negative for _, negative in states):
                return False
            return any(positive for positive, _ in states)

        if not isinstance(expected, dict) or not expected:
            return False
        if any(key not in self._EXPECTED_KEYS for key in expected):
            return False
        if any(not isinstance(value, str) or not value.strip()
               for value in expected.values()):
            return False

        for key, value in expected.items():
            if key == "text_contains":
                states = [self._phrase_state(value, text) for text in all_texts]
                if any(negative for _, negative in states):
                    return False
                if not any(positive for positive, _ in states):
                    return False

            elif key == "summary_contains":
                summary = analysis.get("summary")
                if not isinstance(summary, str):
                    return False
                positive, negative = self._phrase_state(value, summary)
                if negative or not positive:
                    return False

            elif key == "page_title_contains":
                title = analysis.get("page_title")
                if not isinstance(title, str):
                    return False
                positive, negative = self._phrase_state(value, title)
                if negative or not positive:
                    return False

            elif key == "application_equals":
                observed = analysis.get("application")
                if not isinstance(observed, str):
                    return False
                if self._normalize(observed) != self._normalize(value):
                    return False

            elif key == "screen_type_equals":
                observed = analysis.get("screen_type")
                if not isinstance(observed, str):
                    return False
                if self._normalize(observed) != self._normalize(value):
                    return False

            elif key == "element_label_visible":
                matches = [self._phrase_state(value, label) for label in labels]
                if any(negative for _, negative in matches):
                    return False
                if not any(positive for positive, _ in matches):
                    return False

        return True


StructuredVerifier = StructuredEvidenceVerifier
