from __future__ import annotations

from ..models import Point, ScreenSize
from ..utils import clamp_coordinate, validate_screen_size


class CoordinateMapper:
    """Convert between screen pixels and normalized coordinates."""

    def __init__(self, screen_size: ScreenSize) -> None:
        if not isinstance(screen_size, ScreenSize):
            raise TypeError("screen_size must be a ScreenSize instance.")
        validate_screen_size(screen_size.width, screen_size.height)
        self.screen_size = screen_size

    def to_screen(self, x: float, y: float) -> Point:
        """Convert normalized coordinates in [0, 1] to screen pixels."""
        if not 0 <= x <= 1 or not 0 <= y <= 1:
            raise ValueError("Normalized coordinates must be between 0 and 1.")
        return Point(
            x=round(x * (self.screen_size.width - 1)),
            y=round(y * (self.screen_size.height - 1)),
        )

    def to_normalized(self, x: int, y: int) -> tuple[float, float]:
        """Convert screen pixels to normalized coordinates."""
        self.validate_point(x, y)
        return (
            x / max(1, self.screen_size.width - 1),
            y / max(1, self.screen_size.height - 1),
        )

    def clamp(self, x: int, y: int) -> Point:
        return Point(
            x=clamp_coordinate(x, self.screen_size.width),
            y=clamp_coordinate(y, self.screen_size.height),
        )

    def validate_point(self, x: int, y: int) -> None:
        if isinstance(x, bool) or not isinstance(x, int):
            raise TypeError("x must be an integer.")
        if isinstance(y, bool) or not isinstance(y, int):
            raise TypeError("y must be an integer.")
        if not (0 <= x < self.screen_size.width):
            raise ValueError("x is outside the screen bounds.")
        if not (0 <= y < self.screen_size.height):
            raise ValueError("y is outside the screen bounds.")
