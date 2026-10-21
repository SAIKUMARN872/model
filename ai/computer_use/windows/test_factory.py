from __future__ import annotations

from types import SimpleNamespace

import pytest

from ai.computer_use.constants import ApprovalStatus, ComputerUseStatus, RiskLevel
from ai.computer_use.exceptions import (
    ComputerActionError,
    ComputerInitializationError,
)
from ai.computer_use.models import ComputerAction
from ai.computer_use.windows.factory import create_windows_computer


class FakeAutomation:
    def __init__(self):
        self.calls = []

    def size(self):
        return SimpleNamespace(width=800, height=600)

    def position(self):
        return SimpleNamespace(x=20, y=30)

    def moveTo(self, *args, **kwargs):
        self.calls.append(("move", args, kwargs))

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
        return SimpleNamespace(size=(800, 600), save=lambda _path: None)


class FakeWindowsAPI:
    def __init__(self):
        self.windows = [{"handle": 5, "title": "Test Window"}]
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


class FakeContext:
    user_id = "test-user"

    def __init__(self, approved=()):
        self.approved = set(approved)

    def has_permission(self, permission):
        return permission == "computer:execute"

    def has_approval(self, action_id):
        return action_id in self.approved


@pytest.fixture
def setup_computer(monkeypatch):
    monkeypatch.setattr(
        "ai.computer_use.windows.backend.platform.system",
        lambda: "Windows",
    )
    automation = FakeAutomation()
    win32 = FakeWindowsAPI()
    computer = create_windows_computer(
        automation=automation,
        win32=win32,
    )
    computer.initialize()
    return computer, automation, win32


def test_factory_wires_shared_backend_and_initializes_screen_bounds(setup_computer):
    computer, _, _ = setup_computer

    assert computer.initialized
    assert computer.backend is computer.desktop.backend
    assert computer.mouse._backend is computer.backend
    assert computer.keyboard._backend is computer.backend
    assert computer.screenshot._backend is computer.backend

    size = computer.controller.state_manager.get_state().screen_size
    assert (size.width, size.height) == (800, 600)


def test_controller_dispatches_click_through_shared_backend(setup_computer):
    computer, automation, _ = setup_computer
    session = computer.create_session("click-session")
    action = ComputerAction(
        action_id="click-action",
        action_type="click",
        parameters={"x": 100, "y": 120},
    )

    result = computer.execute_action(
        session.session_id, action, FakeContext()
    )

    assert result.status == ComputerUseStatus.COMPLETED
    assert automation.calls == [
        ("click", (), {"x": 100, "y": 120, "button": "left"})
    ]


def test_controller_rejects_out_of_bounds_before_backend_dispatch(setup_computer):
    computer, automation, _ = setup_computer
    session = computer.create_session("bounds-session")
    action = ComputerAction(
        action_id="bounds-action",
        action_type="click",
        parameters={"x": 800, "y": 10},
    )

    with pytest.raises(ComputerActionError, match="outside the screen"):
        computer.execute_action(session.session_id, action, FakeContext())

    assert automation.calls == []


def test_approval_is_required_before_high_risk_click(setup_computer):
    computer, automation, _ = setup_computer
    session = computer.create_session("approval-session")
    action = ComputerAction(
        action_id="approval-action",
        action_type="click",
        parameters={
            "x": 40,
            "y": 50,
            "requires_approval": True,
        },
        risk_level=RiskLevel.HIGH,
    )

    pending = computer.execute_action(
        session.session_id, action, FakeContext()
    )

    assert pending.status == ComputerUseStatus.WAITING_APPROVAL
    assert pending.approval_status == ApprovalStatus.PENDING
    assert automation.calls == []

    approved_context = FakeContext(approved={"approval-action"})
    result = computer.resume_approved_action(
        session.session_id, action, approved_context
    )

    assert result.status == ComputerUseStatus.COMPLETED
    assert result.approval_status == ApprovalStatus.APPROVED
    assert len(automation.calls) == 1


def test_screenshot_action_uses_shared_backend(setup_computer):
    computer, _, _ = setup_computer
    session = computer.create_session("screenshot-session")
    action = ComputerAction(
        action_id="screenshot-action",
        action_type="screenshot",
    )

    result = computer.execute_action(
        session.session_id, action, FakeContext()
    )

    assert result.status == ComputerUseStatus.COMPLETED
    assert result.parameters["capture_result"].width == 800
    assert result.parameters["capture_result"].height == 600


def test_missing_permission_never_dispatches(setup_computer):
    computer, automation, _ = setup_computer
    session = computer.create_session("permission-session")

    class NoPermissionContext(FakeContext):
        def has_permission(self, permission):
            return False

    action = ComputerAction(
        action_id="permission-action",
        action_type="click",
        parameters={"x": 1, "y": 1},
    )

    with pytest.raises(Exception, match="permission"):
        computer.execute_action(
            session.session_id, action, NoPermissionContext()
        )

    assert automation.calls == []


def test_window_and_application_adapters_share_backend(setup_computer):
    computer, _, win32 = setup_computer

    window = computer.windows.find("test window")
    computer.windows.focus(window)

    assert win32.focused == 5
    assert computer.applications.backend is computer.backend


def test_initialization_failure_does_not_leave_facade_initialized(monkeypatch):
    monkeypatch.setattr(
        "ai.computer_use.windows.backend.platform.system",
        lambda: "Linux",
    )
    computer = create_windows_computer(
        automation=FakeAutomation(),
        win32=FakeWindowsAPI(),
    )

    from ai.computer_use.exceptions import ComputerUseError

    with pytest.raises(ComputerUseError, match="Computer initialization failed"):
        computer.initialize()

    assert not computer.initialized

def test_factory_injects_verification(monkeypatch):
    monkeypatch.setattr(
        "ai.computer_use.windows.backend.platform.system",
        lambda: "Windows",
    )

    class FakeVerification:
        def verify(self, expected, actual):
            return True

    verifier = FakeVerification()
    computer = create_windows_computer(
        automation=FakeAutomation(),
        win32=FakeWindowsAPI(),
        verification=verifier,
    )

    assert computer.controller.executor.verification is verifier

