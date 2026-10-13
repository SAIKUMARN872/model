import pytest

from ai.action_platform.core.context import ActionContext
from ai.computer_use.constants import (
    ApprovalStatus, ComputerUseStatus, RiskLevel
)
from ai.computer_use.controller import ComputerController
from ai.computer_use.exceptions import (
    ComputerActionError, ComputerUseError, SecurityViolationError
)
from ai.computer_use.executor import ComputerExecutor
from ai.computer_use.models import ComputerAction, ComputerState, ScreenSize


class FakeMouse:
    def __init__(self):
        self.calls = []

    def move(self, x, y): self.calls.append(("move", x, y))
    def click(self, x, y): self.calls.append(("click", x, y))
    def double_click(self, x, y): self.calls.append(("double_click", x, y))
    def right_click(self, x, y): self.calls.append(("right_click", x, y))
    def drag(self, sx, sy, ex, ey): self.calls.append(("drag", sx, sy, ex, ey))
    def scroll(self, amount): self.calls.append(("scroll", amount))


class FakeKeyboard:
    def __init__(self):
        self.calls = []

    def type_text(self, text): self.calls.append(("type", text))
    def press(self, key): self.calls.append(("press", key))
    def hotkey(self, *keys): self.calls.append(("hotkey", *keys))


class FakeScreenshot:
    def capture(self):
        return {"fake": True}


class FakeApproval:
    def __init__(self, decision):
        self.decision = decision
        self.calls = []

    def request_approval(self, action):
        self.calls.append(action)
        return self.decision


def context(*, permissions=("computer:execute",), approved=()):
    return ActionContext(
        user_id="test-user",
        permissions=set(permissions),
        approved_actions=set(approved),
    )


def action(kind, **parameters):
    return ComputerAction(
        action_id="action-1",
        action_type=kind,
        parameters=parameters,
    )


def test_click_dispatches_to_injected_mouse():
    mouse = FakeMouse()
    executor = ComputerExecutor(mouse=mouse)
    result = executor.execute(
        action("click", x=20, y=30),
        context(),
        ComputerState(screen_size=ScreenSize(100, 100)),
    )
    assert mouse.calls == [("click", 20, 30)]
    assert result.status == ComputerUseStatus.COMPLETED


def test_rejects_coordinates_outside_screen():
    mouse = FakeMouse()
    with pytest.raises(ComputerActionError):
        ComputerExecutor(mouse=mouse).execute(
            action("click", x=100, y=1),
            context(),
            ComputerState(screen_size=ScreenSize(100, 100)),
        )
    assert mouse.calls == []


def test_permission_is_required():
    with pytest.raises(SecurityViolationError):
        ComputerExecutor(mouse=FakeMouse()).execute(
            action("click", x=1, y=2),
            context(permissions=()),
        )


def test_high_risk_action_waits_for_approval():
    mouse = FakeMouse()
    item = action("click", x=1, y=2, intent="purchase")
    result = ComputerExecutor(mouse=mouse).execute(item, context())
    assert result.status == ComputerUseStatus.WAITING_APPROVAL
    assert result.approval_status == ApprovalStatus.PENDING
    assert mouse.calls == []


def test_approved_high_risk_action_executes():
    mouse = FakeMouse()
    item = action("click", x=1, y=2, intent="purchase")
    result = ComputerExecutor(mouse=mouse).execute(
        item, context(approved=("action-1",))
    )
    assert result.status == ComputerUseStatus.COMPLETED
    assert result.approval_status == ApprovalStatus.APPROVED
    assert mouse.calls == [("click", 1, 2)]


def test_approval_adapter_can_approve():
    mouse = FakeMouse()
    approval = FakeApproval(True)
    result = ComputerExecutor(mouse=mouse, approval=approval).execute(
        action("click", x=2, y=3, requires_approval=True), context()
    )
    assert result.status == ComputerUseStatus.COMPLETED
    assert len(approval.calls) == 1
    assert mouse.calls == [("click", 2, 3)]


def test_keyboard_and_screenshot_dispatch():
    keyboard = FakeKeyboard()
    executor = ComputerExecutor(keyboard=keyboard, screenshot=FakeScreenshot())
    executor.execute(action("type", text="hello"), context())
    executor.execute(action("hotkey", keys=["ctrl", "s"]), context())
    shot = executor.execute(action("screenshot"), context())
    assert keyboard.calls == [("type", "hello"), ("hotkey", "ctrl", "s")]
    assert shot.parameters["capture_result"] == {"fake": True}


def test_controller_records_actions_and_pauses_session_for_approval():
    mouse = FakeMouse()
    controller = ComputerController(executor=ComputerExecutor(mouse=mouse))
    session = controller.create_session()
    pending = controller.execute_action(
        session.session_id, action("click", x=3, y=4, intent="payment"), context()
    )
    assert pending.status == ComputerUseStatus.WAITING_APPROVAL
    stored = controller.get_session(session.session_id)
    assert stored.status == ComputerUseStatus.WAITING_APPROVAL
    assert len(stored.actions) == 1
    assert mouse.calls == []


def test_controller_resumes_after_explicit_approval():
    mouse = FakeMouse()
    controller = ComputerController(executor=ComputerExecutor(mouse=mouse))
    session = controller.create_session()
    pending = controller.execute_action(
        session.session_id, action("click", x=3, y=4, intent="payment"), context()
    )
    approved_context = context(approved=(pending.action_id,))
    result = controller.resume_approved_action(
        session.session_id, pending, approved_context
    )
    assert result.status == ComputerUseStatus.COMPLETED
    assert mouse.calls == [("click", 3, 4)]


def test_controller_rejects_resume_without_approval():
    controller = ComputerController(executor=ComputerExecutor(mouse=FakeMouse()))
    session = controller.create_session()
    pending = controller.execute_action(
        session.session_id, action("click", x=3, y=4, intent="purchase"), context()
    )
    with pytest.raises(ComputerUseError):
        controller.resume_approved_action(session.session_id, pending, context())


def test_unsupported_action_never_dispatches():
    mouse = FakeMouse()
    with pytest.raises(ComputerActionError):
        ComputerExecutor(mouse=mouse).execute(action("shell", command="no"), context())
    assert mouse.calls == []


def test_controller_failed_approved_action_replaces_history_record():
    class FailingMouse(FakeMouse):
        def click(self, x, y):
            self.calls.append(("click", x, y))
            raise RuntimeError("simulated mouse failure")

    mouse = FailingMouse()
    controller = ComputerController(executor=ComputerExecutor(mouse=mouse))
    session = controller.create_session()

    pending = controller.execute_action(
        session.session_id,
        action("click", x=3, y=4, intent="payment"),
        context(),
    )
    approved_context = context(approved=(pending.action_id,))

    with pytest.raises(ComputerActionError, match="simulated mouse failure"):
        controller.resume_approved_action(
            session.session_id, pending, approved_context
        )

    stored = controller.get_session(session.session_id)
    assert len(stored.actions) == 1
    assert stored.actions[0].action_id == pending.action_id
    assert stored.actions[0].status == ComputerUseStatus.FAILED
    assert stored.status == ComputerUseStatus.RUNNING
    assert mouse.calls == [("click", 3, 4)]
