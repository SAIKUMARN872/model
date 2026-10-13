from __future__ import annotations

import math
from typing import Any

from ..models import BoundingBox, UIElement


def normalize_element(
    raw: UIElement | dict[str, Any],
    *,
    screen_width: int | None = None,
    screen_height: int | None = None,
    index: int = 0,
) -> UIElement:
    """Convert a detector result into a validated UIElement."""

    if isinstance(raw, UIElement):
        element = raw
    elif isinstance(raw, dict):
        bounds_raw = raw.get("bounds", raw.get("bounding_box", raw.get("bbox")))
        bounds = None

        if bounds_raw is not None:
            if isinstance(bounds_raw, BoundingBox):
                bounds = bounds_raw
            elif isinstance(bounds_raw, dict):
                try:
                    bounds = BoundingBox(
                        x=bounds_raw["x"],
                        y=bounds_raw["y"],
                        width=bounds_raw["width"],
                        height=bounds_raw["height"],
                    )
                except (KeyError, TypeError) as exc:
                    raise ValueError("Invalid element bounds.") from exc
            elif isinstance(bounds_raw, (list, tuple)) and len(bounds_raw) == 4:
                bounds = BoundingBox(*bounds_raw)
            else:
                raise ValueError("Bounds must be a box, mapping, or four-item sequence.")

        confidence = raw.get("confidence", 0.0)
        if (
            isinstance(confidence, bool)
            or not isinstance(confidence, (int, float))
            or not math.isfinite(confidence)
            or not 0.0 <= confidence <= 1.0
        ):
            raise ValueError("Element confidence must be between 0 and 1.")

        element_type = raw.get("element_type", raw.get("type", "unknown"))
        label = raw.get("label", raw.get("text"))
        element_id = raw.get("element_id", raw.get("id", f"detected-{index}"))
        metadata = raw.get("metadata", {})
        interactable = raw.get("interactable", True)
        if isinstance(metadata, dict) and metadata.get("source") == "tesseract_ocr":
            interactable = False

        if not isinstance(element_type, str) or not element_type.strip():
            raise ValueError("Element type must be a non-empty string.")
        if label is not None and not isinstance(label, str):
            raise ValueError("Element label must be a string or None.")
        if not isinstance(element_id, str) or not element_id.strip():
            raise ValueError("Element ID must be a non-empty string.")
        if not isinstance(interactable, bool):
            raise ValueError("Element interactable must be a boolean.")
        if not isinstance(metadata, dict):
            raise ValueError("Element metadata must be a dictionary.")

        element = UIElement(
            element_id=element_id,
            element_type=element_type.strip().lower(),
            label=label,
            bounds=bounds,
            confidence=float(confidence),
            interactable=interactable,
            metadata=dict(metadata),
        )
    else:
        raise ValueError("Detector results must be dictionaries or UIElement objects.")

    if element.bounds is not None:
        box = element.bounds
        values = (box.x, box.y, box.width, box.height)
        if any(isinstance(value, bool) or not isinstance(value, int) for value in values):
            raise ValueError("Bounding box coordinates must be integers.")
        if box.x < 0 or box.y < 0 or box.width <= 0 or box.height <= 0:
            raise ValueError("Bounding box must have non-negative origin and positive size.")
        if screen_width is not None and box.x + box.width > screen_width:
            raise ValueError("Bounding box exceeds screen width.")
        if screen_height is not None and box.y + box.height > screen_height:
            raise ValueError("Bounding box exceeds screen height.")

    return element


def normalize_elements(
    raw_elements: Any,
    *,
    screen_width: int | None = None,
    screen_height: int | None = None,
) -> list[UIElement]:
    if not isinstance(raw_elements, (list, tuple)):
        raise ValueError("Detector must return a list of elements.")
    return [
        normalize_element(
            item,
            screen_width=screen_width,
            screen_height=screen_height,
            index=index,
        )
        for index, item in enumerate(raw_elements)
    ]


UIElementNormalizer = normalize_elements

