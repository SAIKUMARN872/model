from __future__ import annotations

from typing import Any

from .window import WindowAdapter


class WindowManager:
    """Small orchestration layer for window discovery and focus."""

    def __init__(self, adapter: WindowAdapter) -> None:
        if not isinstance(adapter, WindowAdapter):
            raise TypeError("adapter must be a WindowAdapter.")
        self.adapter = adapter

    def find(self, title: str) -> Any:
        return self.adapter.find(title)

    def focus(self, title: str) -> Any:
        window = self.adapter.find(title)
        self.adapter.focus(window)
        return window
