from __future__ import annotations

from types import SimpleNamespace

import pytest

from ai.computer_use.exceptions import (
    ApplicationNotFoundError,
    ComputerActionError,
    ComputerInitializationError,
)
from ai.computer_use.windows.backend import WindowsComputerBackend


class FakeAutomation:
    def __init__(self):
        self.calls = []

    def size(self):
        return SimpleNamespace(width=1920, height=1080)

    def position(self):
        return SimpleNamespace(x=15, y=25)

    def moveTo(self, *args, **kwargs):
        self.calls.append(("moveTo", args, kwargs))

    def click(self, *args, **kwargs):
        self.calls.append(("click", args, kwargs))

    def doubleClick(self, *args, **kwargs):
        self.calls.append(("doubleClick", args, kwargs))

    def rightClick(self, *args, **kwargs):
        self.calls.append(("rightClick", args, kwargs))

    def dragTo(self, *args, **kwargs):
        self.calls.append(("dragTo", args, kwargs))

    def scroll(self, *args, **kwargs):
        self.calls.append(("scroll", args, kwargs))

    def write(self, *args, **kwargs):
        self.calls.append(("write", args, kwargs))

    def press(self, *args, **kwargs):
        self.calls.append(("press", args, kwargs))

    def hotkey(self, *args, **kwargs):
        self.calls.append(("hotkey", args, kwargs))

    def screenshot(self):
        return {"fake": "image"}


class FakeWindowsAPI:
    def __init__(self):
        self.windows = [
            {"handle": 10, "title": "Browser - ModelNow"},
            {"handle": 11, "title": "Text Editor"},
        ]
        self.focused = None

    def list_windows(self):
        return list(self.windows)

    def get_foreground_window(self):
        return self.focused

    def set_foreground_window(self, handle):
        if not any(item["handle"] == handle for item in self.windows):
            return False
        self.focused = handle
        return True


class FakeProcess:
    def __init__(self, command, shell):
        self.command = command
        self.shell = shell
        self.terminated = False

    def poll(self):
        return 1 if self.terminated else None

    def terminate(self):
        self.terminated = True


@pytest.fixture
def backend(monkeypatch):
    monkeypatch.setattr(
        "ai.computer_use.windows.backend.platform.system",
        lambda: "Windows",
    )
    automation = FakeAutomation()
    windows = FakeWindowsAPI()
    processes = []

    def process_factory(command, shell):
        process = FakeProcess(command, shell)
        processes.append(process)
        return process

    instance = WindowsComputerBackend(
        automation=automation,
        win32=windows,
        process_factory=process_factory,
    )
    instance.initialize()
    return instance, automation, windows, processes


def test_initialization_is_idempotent_and_state_is_readable(backend):
    instance, _, _, _ = backend
    instance.initialize()
    state = instance.get_state()

    assert state["platform"] == "windows"
    assert state["screen_size"] == {"width": 1920, "height": 1080}
    assert state["cursor"] == {"x": 15, "y": 25}


def test_mouse_and_keyboard_methods_dispatch_to_injected_backend(backend):
    instance, automation, _, _ = backend
    instance.moveTo(10, 20)
    instance.click(x=10, y=20, button="left")
    instance.write("safe test")
    instance.hotkey("ctrl", "a")

    assert [call[0] for call in automation.calls] == [
        "moveTo", "click", "write", "hotkey"
    ]


def test_screenshot_uses_injected_automation(backend):
    instance, _, _, _ = backend
    assert instance.screenshot() == {"fake": "image"}


def test_window_find_and_focus(backend):
    instance, _, windows, _ = backend
    window = instance.find("modelnow")

    assert window["handle"] == 10
    instance.focus(window)
    assert windows.focused == 10


def test_missing_window_returns_none(backend):
    instance, _, _, _ = backend
    assert instance.find("not present") is None


def test_application_launch_and_close_only_tracks_its_process(backend):
    instance, _, _, processes = backend
    process = instance.launch("fake-app.exe")

    assert process.command == ["fake-app.exe"]
    assert process.shell is False
    assert len(processes) == 1

    instance.close("fake-app.exe")
    assert process.terminated is True


def test_closing_untracked_application_is_rejected(backend):
    instance, _, _, _ = backend

    with pytest.raises(ApplicationNotFoundError):
        instance.close("untracked.exe")


def test_operations_require_initialization(backend):
    instance, _, _, _ = backend
    instance.shutdown()

    with pytest.raises(ComputerActionError, match="not initialized"):
        instance.get_state()


def test_non_windows_initialization_is_rejected(monkeypatch):
    monkeypatch.setattr(
        "ai.computer_use.windows.backend.platform.system",
        lambda: "Linux",
    )
    instance = WindowsComputerBackend(
        automation=FakeAutomation(),
        win32=FakeWindowsAPI(),
    )

    with pytest.raises(ComputerInitializationError, match="Windows"):
        instance.initialize()
