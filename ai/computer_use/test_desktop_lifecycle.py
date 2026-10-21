import pytest

from ai.computer_use.applications import ApplicationAdapter, ApplicationManager
from ai.computer_use.desktop import DesktopComputer
from ai.computer_use.exceptions import (
    ApplicationNotFoundError,
    ComputerActionError,
    ComputerInitializationError,
    ComputerUseError,
    WindowNotFoundError,
)
from ai.computer_use.windows import WindowAdapter, WindowManager


class FakeDesktopBackend:
    def __init__(self):
        self.calls = []

    def initialize(self):
        self.calls.append("initialize")

    def shutdown(self):
        self.calls.append("shutdown")

    def get_state(self):
        self.calls.append("get_state")
        return {"display": "fake", "width": 640, "height": 480}


def test_desktop_lifecycle_and_state():
    backend = FakeDesktopBackend()
    desktop = DesktopComputer(backend)

    with pytest.raises(ComputerUseError):
        desktop.get_state()

    desktop.initialize()
    desktop.initialize()
    assert desktop.initialized
    assert desktop.get_state()["width"] == 640
    desktop.shutdown()
    desktop.shutdown()

    assert not desktop.initialized
    assert backend.calls == ["initialize", "get_state", "shutdown"]


def test_desktop_requires_backend_and_wraps_initialization_errors():
    with pytest.raises(ComputerInitializationError):
        DesktopComputer().initialize()

    class BrokenBackend(FakeDesktopBackend):
        def initialize(self):
            raise RuntimeError("failure")

    with pytest.raises(ComputerInitializationError):
        DesktopComputer(BrokenBackend()).initialize()


class FakeApplicationBackend:
    def __init__(self):
        self.calls = []

    def launch(self, name):
        self.calls.append(("launch", name))
        return type("Process", (), {"pid": 123})()

    def close(self, name):
        self.calls.append(("close", name))


def test_application_manager_tracks_launch_and_close():
    backend = FakeApplicationBackend()
    manager = ApplicationManager(ApplicationAdapter(backend))

    launched = manager.launch("Example App")
    assert launched.name == "Example App"
    assert launched.running is True
    assert launched.process_id == 123

    manager.close("example app")
    assert manager.get("EXAMPLE APP").running is False
    assert backend.calls == [
        ("launch", "Example App"),
        ("close", "Example App"),
    ]


def test_application_manager_rejects_untracked_close():
    manager = ApplicationManager(
        ApplicationAdapter(FakeApplicationBackend())
    )
    with pytest.raises(ApplicationNotFoundError):
        manager.close("unknown")


def test_application_backend_failures_are_wrapped():
    class BrokenBackend:
        def launch(self, name):
            raise RuntimeError("launch failed")

        def close(self, name):
            raise RuntimeError("close failed")

    adapter = ApplicationAdapter(BrokenBackend())
    with pytest.raises(ComputerActionError):
        adapter.launch("App")


class FakeWindowBackend:
    def __init__(self):
        self.focused = None

    def find(self, title):
        return {"title": title} if title == "Editor" else None

    def focus(self, window):
        self.focused = window


def test_window_find_and_focus():
    backend = FakeWindowBackend()
    manager = WindowManager(WindowAdapter(backend))

    window = manager.find("Editor")
    assert window == {"title": "Editor"}
    assert manager.focus("Editor") == window
    assert backend.focused == window


def test_missing_window_raises_typed_error():
    manager = WindowManager(WindowAdapter(FakeWindowBackend()))
    with pytest.raises(WindowNotFoundError):
        manager.find("Missing")


def test_window_backend_errors_are_wrapped():
    class BrokenWindowBackend:
        def find(self, title):
            raise RuntimeError("find failed")

        def focus(self, window):
            raise RuntimeError("focus failed")

    adapter = WindowAdapter(BrokenWindowBackend())
    with pytest.raises(ComputerActionError):
        adapter.find("Editor")
    with pytest.raises(ComputerActionError):
        adapter.focus({"title": "Editor"})
