from __future__ import annotations

import platform
import subprocess
from typing import Any

from ..exceptions import (
    ApplicationNotFoundError,
    ComputerActionError,
    ComputerInitializationError,
    ScreenCaptureError,
    WindowNotFoundError,
)


class _Win32WindowAPI:
    """Small, lazy wrapper around the Windows user32 window APIs."""

    def __init__(self) -> None:
        if platform.system() != "Windows":
            raise ComputerInitializationError(
                "The native desktop backend is supported only on Windows."
            )
        import ctypes

        self._ctypes = ctypes
        self._user32 = ctypes.windll.user32

    def list_windows(self) -> list[dict[str, Any]]:
        ctypes = self._ctypes
        user32 = self._user32
        windows: list[dict[str, Any]] = []
        callback_type = ctypes.WINFUNCTYPE(
            ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p
        )

        def visit(hwnd: Any, _extra: Any) -> bool:
            if not user32.IsWindowVisible(hwnd):
                return True
            length = user32.GetWindowTextLengthW(hwnd)
            if length <= 0:
                return True
            buffer = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buffer, length + 1)
            title = buffer.value.strip()
            if title:
                windows.append({"handle": hwnd, "title": title})
            return True

        callback = callback_type(visit)
        if not user32.EnumWindows(callback, 0):
            raise OSError("EnumWindows failed.")
        return windows

    def get_foreground_window(self) -> Any:
        return self._user32.GetForegroundWindow()

    def set_foreground_window(self, handle: Any) -> bool:
        return bool(self._user32.SetForegroundWindow(handle))


class WindowsComputerBackend:
    """Optional Windows backend for existing Computer Use adapters.

    Importing this module does not import pyautogui or access user32.
    Call initialize() explicitly before performing desktop operations.
    """

    def __init__(
        self,
        automation: Any = None,
        win32: Any = None,
        process_factory: Any = subprocess.Popen,
    ) -> None:
        self._automation = automation
        self._win32 = win32
        self._process_factory = process_factory
        self._processes: dict[str, Any] = {}
        self._initialized = False

    @property
    def initialized(self) -> bool:
        return self._initialized

    def initialize(self) -> None:
        if self._initialized:
            return
        if platform.system() != "Windows":
            raise ComputerInitializationError(
                "WindowsComputerBackend requires Windows."
            )

        try:
            if self._automation is None:
                import pyautogui
                self._automation = pyautogui
            if self._win32 is None:
                self._win32 = _Win32WindowAPI()

            for method in ("size", "position", "moveTo", "click",
                           "doubleClick", "rightClick", "dragTo",
                           "scroll", "write", "press", "hotkey",
                           "screenshot"):
                if not callable(getattr(self._automation, method, None)):
                    raise TypeError(
                        f"Automation backend does not implement {method}()."
                    )

            if not callable(getattr(self._win32, "list_windows", None)):
                raise TypeError("Window backend must implement list_windows().")
            if not callable(
                getattr(self._win32, "set_foreground_window", None)
            ):
                raise TypeError(
                    "Window backend must implement set_foreground_window()."
                )
            self._initialized = True
        except ComputerInitializationError:
            raise
        except Exception as exc:
            raise ComputerInitializationError(
                "Could not initialize the Windows desktop backend. "
                "Check platform support and optional dependencies."
            ) from exc

    def shutdown(self) -> None:
        self._initialized = False

    def _require_initialized(self) -> None:
        if not self._initialized:
            raise ComputerActionError(
                "Windows backend is not initialized."
            )

    def get_state(self) -> dict[str, Any]:
        self._require_initialized()
        try:
            size = self._automation.size()
            position = self._automation.position()
            foreground = getattr(
                self._win32, "get_foreground_window", lambda: None
            )()
            active = next(
                (
                    item for item in self._win32.list_windows()
                    if item.get("handle") == foreground
                ),
                None,
            )
            return {
                "platform": "windows",
                "screen_size": {
                    "width": int(size.width),
                    "height": int(size.height),
                },
                "cursor": {"x": int(position.x), "y": int(position.y)},
                "active_window": active,
            }
        except Exception as exc:
            raise ComputerActionError("Could not read Windows desktop state.") from exc

    def moveTo(self, x: int, y: int) -> Any:
        self._require_initialized()
        return self._automation.moveTo(x, y)

    def click(self, *args: Any, **kwargs: Any) -> Any:
        self._require_initialized()
        return self._automation.click(*args, **kwargs)

    def doubleClick(self, *args: Any, **kwargs: Any) -> Any:
        self._require_initialized()
        return self._automation.doubleClick(*args, **kwargs)

    def rightClick(self, *args: Any, **kwargs: Any) -> Any:
        self._require_initialized()
        return self._automation.rightClick(*args, **kwargs)

    def dragTo(self, *args: Any, **kwargs: Any) -> Any:
        self._require_initialized()
        return self._automation.dragTo(*args, **kwargs)

    def scroll(self, *args: Any, **kwargs: Any) -> Any:
        self._require_initialized()
        return self._automation.scroll(*args, **kwargs)

    def write(self, *args: Any, **kwargs: Any) -> Any:
        self._require_initialized()
        return self._automation.write(*args, **kwargs)

    def press(self, *args: Any, **kwargs: Any) -> Any:
        self._require_initialized()
        return self._automation.press(*args, **kwargs)

    def hotkey(self, *args: Any, **kwargs: Any) -> Any:
        self._require_initialized()
        return self._automation.hotkey(*args, **kwargs)

    def screenshot(self) -> Any:
        self._require_initialized()
        try:
            image = self._automation.screenshot()
            if image is None:
                raise ScreenCaptureError("Screenshot backend returned no image.")
            return image
        except ScreenCaptureError:
            raise
        except Exception as exc:
            raise ScreenCaptureError("Windows screenshot capture failed.") from exc

    def launch(self, application: str) -> Any:
        self._require_initialized()
        if not isinstance(application, str) or not application.strip():
            raise ValueError("application must be a non-empty executable path.")
        executable = application.strip()
        key = executable.casefold()
        if key in self._processes and self._processes[key].poll() is None:
            return self._processes[key]
        try:
            process = self._process_factory([executable], shell=False)
        except Exception as exc:
            raise ApplicationNotFoundError(
                f"Could not launch executable '{executable}'."
            ) from exc
        self._processes[key] = process
        return process

    def close(self, application: str) -> None:
        self._require_initialized()
        if not isinstance(application, str) or not application.strip():
            raise ValueError("application must be a non-empty executable path.")
        key = application.strip().casefold()
        process = self._processes.get(key)
        if process is None or process.poll() is not None:
            raise ApplicationNotFoundError(
                f"No running application launched by this backend: '{application}'."
            )
        try:
            process.terminate()
        except Exception as exc:
            raise ComputerActionError(
                f"Could not close application '{application}'."
            ) from exc

    def find(self, title: str) -> dict[str, Any] | None:
        self._require_initialized()
        if not isinstance(title, str) or not title.strip():
            raise ValueError("window title must be a non-empty string.")
        needle = title.strip().casefold()
        try:
            return next(
                (
                    item for item in self._win32.list_windows()
                    if needle in str(item.get("title", "")).casefold()
                ),
                None,
            )
        except Exception as exc:
            raise ComputerActionError("Windows window discovery failed.") from exc

    def focus(self, window: Any) -> None:
        self._require_initialized()
        handle = window.get("handle") if isinstance(window, dict) else window
        if handle is None:
            raise WindowNotFoundError("Window handle is missing.")
        try:
            focused = self._win32.set_foreground_window(handle)
        except Exception as exc:
            raise ComputerActionError("Windows could not focus the window.") from exc
        if not focused:
            raise ComputerActionError(
                "Windows refused to focus the requested window."
            )
