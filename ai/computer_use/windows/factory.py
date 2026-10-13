from __future__ import annotations

from typing import Any

from ..applications import ApplicationAdapter
from ..computer import Computer
from ..controller import ComputerController
from ..desktop import DesktopComputer
from ..executor import ComputerExecutor
from ..keyboard import KeyboardActions
from ..models import ScreenSize
from ..mouse import MouseActions
from ..screenshot.capture import ScreenshotCapture
from .backend import WindowsComputerBackend
from .window import WindowAdapter


class WindowsComputer(Computer):
    """Computer facade that synchronizes validated Windows screen bounds."""

    def initialize(self) -> None:
        super().initialize()
        if self.desktop is None:
            return

        try:
            state = self.desktop.get_state()
            dimensions = state.get("screen_size")
            if not isinstance(dimensions, dict):
                return

            width = dimensions.get("width")
            height = dimensions.get("height")
            if (
                isinstance(width, bool)
                or not isinstance(width, int)
                or isinstance(height, bool)
                or not isinstance(height, int)
                or width <= 0
                or height <= 0
            ):
                raise ValueError("Desktop returned invalid screen dimensions.")

            self.controller.state_manager.update(
                screen_size=ScreenSize(width=width, height=height)
            )
        except Exception as exc:
            try:
                super().shutdown()
            except Exception:
                pass
            from ..exceptions import ComputerInitializationError

            raise ComputerInitializationError(
                "Could not synchronize Windows screen dimensions."
            ) from exc


def create_windows_computer(
    *,
    approval: Any = None,
    automation: Any = None,
    win32: Any = None,
    process_factory: Any = None,
    perception: Any = None,
    verification: Any = None,
) -> WindowsComputer:
    """Create a shared-backend Computer Use stack.

    Optional dependencies and OS access are initialized only when
    initialize() is called. The controller remains the execution entry point.
    """
    backend_args: dict[str, Any] = {
        "automation": automation,
        "win32": win32,
    }
    if process_factory is not None:
        backend_args["process_factory"] = process_factory

    backend = WindowsComputerBackend(**backend_args)
    desktop = DesktopComputer(backend)
    mouse = MouseActions(backend)
    keyboard = KeyboardActions(backend)
    screenshot = ScreenshotCapture(backend)

    executor = ComputerExecutor(
        mouse=mouse,
        keyboard=keyboard,
        screenshot=screenshot,
        approval=approval,
        perception=perception,
        verification=verification,
    )
    controller = ComputerController(executor=executor)

    computer = WindowsComputer(desktop=desktop, controller=controller)
    computer.backend = backend
    computer.mouse = mouse
    computer.keyboard = keyboard
    computer.screenshot = screenshot
    computer.applications = ApplicationAdapter(backend)
    computer.windows = WindowAdapter(backend)
    return computer
