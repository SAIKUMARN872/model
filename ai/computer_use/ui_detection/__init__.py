"""UI detection and normalized element models."""

from .detector import UIDetector, UIElementDetector
from .elements import UIElementNormalizer, normalize_element, normalize_elements

__all__ = [
    "UIElementDetector",
    "UIDetector",
    "UIElementNormalizer",
    "normalize_element",
    "normalize_elements",
]
