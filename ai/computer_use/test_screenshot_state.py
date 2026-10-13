import pytest

from ai.computer_use.constants import ComputerUseStatus
from ai.computer_use.controller import ComputerController
from ai.computer_use.exceptions import ComputerActionError
from ai.computer_use.executor import ComputerExecutor
from ai.computer_use.models import ScreenSize
from ai.computer_use.screenshot.capture import ScreenshotCapture
from ai.computer_use.screenshot.manager import ScreenshotManager


class Context:
    user_id = "test-user"

    def has_permission(self, permission):
        return permission == "computer:execute"


class FakeImage:
    size = (640, 480)

    def save(self, path):
        pass


class FakeBackend:
    def screenshot(self):
        return FakeImage()


class FailingBackend:
    def screenshot(self):
        raise RuntimeError("capture unavailable")


def test_screenshot_updates_global_and_session_state():
    capture = ScreenshotManager(ScreenshotCapture(FakeBackend()))
    controller = ComputerController(executor=ComputerExecutor(screenshot=capture))
    session = controller.create_session("screenshot-session")

    action = controller.executor.create_action("screenshot")
    result = controller.execute_action(session.session_id, action, Context())

    assert result.status == ComputerUseStatus.COMPLETED
    assert result.parameters["capture_result"].width == 640
    assert result.parameters["capture_result"].height == 480

    global_state = controller.state_manager.get_state()
    saved_session = controller.get_session(session.session_id)
    assert global_state.screen_size == ScreenSize(640, 480)
    assert global_state.screenshot.screenshot_id == result.parameters["capture_result"].screenshot_id
    assert saved_session.state.screen_size == ScreenSize(640, 480)
    assert saved_session.state.screenshot.screenshot_id == global_state.screenshot.screenshot_id
    assert saved_session.actions[0].parameters["capture_result"].width == 640


def test_failed_capture_does_not_replace_existing_screen_state():
    capture = ScreenshotManager(ScreenshotCapture(FailingBackend()))
    controller = ComputerController(executor=ComputerExecutor(screenshot=capture))
    session = controller.create_session("failed-screenshot-session")
    controller.state_manager.update(screen_size=ScreenSize(800, 600))

    action = controller.executor.create_action("screenshot")
    with pytest.raises(ComputerActionError):
        controller.execute_action(session.session_id, action, Context())

    assert controller.state_manager.get_state().screen_size == ScreenSize(800, 600)
    saved_session = controller.get_session(session.session_id)
    assert len(saved_session.actions) == 1
    assert saved_session.actions[0].status == ComputerUseStatus.FAILED
