from types import SimpleNamespace

import pytest

from ai.computer_use.constants import ComputerUseStatus
from ai.computer_use.controller import ComputerController
from ai.computer_use.exceptions import ComputerActionError
from ai.computer_use.executor import ComputerExecutor
from ai.computer_use.models import BoundingBox, ScreenSize, UIElement
from ai.computer_use.visual_interface.perception import VisualPerception
from ai.computer_use.windows.factory import create_windows_computer


class FakeContext:
    user_id = "perception-test"

    def has_permission(self, permission):
        return permission == "computer:execute"


class FakeImage:
    size = (640, 480)


class FakeScreenshot:
    def __init__(self, image=None):
        self.image = image or FakeImage()

    def capture(self):
        return self.image


class FakeMouse:
    def __init__(self):
        self.calls = []

    def click(self, x, y):
        self.calls.append((x, y))


class FakeAnalyzer:
    def analyze(self, image):
        assert image is not None
        return {"summary": "A test screen", "screen_type": "desktop"}


class FakeDetector:
    def __init__(self, elements):
        self.elements = elements

    def detect(self, image):
        assert image is not None
        return self.elements


def make_action(executor):
    return executor.create_action("screenshot")


def test_screenshot_populates_analysis_and_ui_elements():
    perception = VisualPerception(
        analyzer=FakeAnalyzer(),
        detector=FakeDetector([
            {
                "element_id": "button-1",
                "element_type": "button",
                "label": "Continue",
                "bounds": {"x": 10, "y": 20, "width": 100, "height": 30},
                "confidence": 0.98,
                "interactable": True,
            }
        ]),
    )
    executor = ComputerExecutor(
        screenshot=FakeScreenshot(),
        perception=perception,
    )
    controller = ComputerController(executor=executor)
    session = controller.create_session("perception-session")

    result = controller.execute_action(
        session.session_id, make_action(executor), FakeContext()
    )

    assert result.status == ComputerUseStatus.COMPLETED
    state = controller.state_manager.get_state()
    assert state.screen_size == ScreenSize(640, 480)
    assert state.metadata["last_screen_analysis"]["summary"] == "A test screen"
    assert state.metadata["ui_detection_available"] is True
    assert len(state.ui_elements) == 1
    assert state.ui_elements[0] == UIElement(
        element_id="button-1",
        element_type="button",
        label="Continue",
        bounds=BoundingBox(10, 20, 100, 30),
        confidence=0.98,
        interactable=True,
        metadata={},
    )
    saved = controller.get_session(session.session_id)
    assert len(saved.state.ui_elements) == 1


def test_screenshot_without_perception_keeps_capture_working():
    executor = ComputerExecutor(screenshot=FakeScreenshot())
    controller = ComputerController(executor=executor)
    session = controller.create_session("screenshot-only-session")

    result = controller.execute_action(
        session.session_id, make_action(executor), FakeContext()
    )

    assert result.status == ComputerUseStatus.COMPLETED
    state = controller.state_manager.get_state()
    assert state.screen_size == ScreenSize(640, 480)
    assert state.ui_elements == []
    assert "last_screen_analysis" not in state.metadata


def test_invalid_detection_does_not_replace_existing_state():
    perception = VisualPerception(
        detector=FakeDetector([
            {
                "element_id": "outside",
                "element_type": "button",
                "bounds": {"x": 630, "y": 20, "width": 30, "height": 20},
            }
        ])
    )
    executor = ComputerExecutor(
        screenshot=FakeScreenshot(),
        perception=perception,
    )
    controller = ComputerController(executor=executor)
    session = controller.create_session("invalid-detection-session")
    previous = UIElement(element_id="previous", element_type="text")
    controller.state_manager.update(
        screen_size=ScreenSize(800, 600),
        ui_elements=[previous],
    )

    with pytest.raises(ComputerActionError):
        controller.execute_action(
            session.session_id, make_action(executor), FakeContext()
        )

    state = controller.state_manager.get_state()
    assert state.screen_size == ScreenSize(800, 600)
    assert state.ui_elements == [previous]
