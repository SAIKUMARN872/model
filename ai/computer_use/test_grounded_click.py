import pytest

from ai.computer_use.constants import ComputerUseStatus
from ai.computer_use.exceptions import ComputerActionError
from ai.computer_use.executor import ComputerExecutor
from ai.computer_use.models import (
    BoundingBox,
    ComputerState,
    ScreenSize,
    UIElement,
)


class FakeContext:
    def has_permission(self, permission):
        return permission == "computer:execute"

    def has_approval(self, action_id):
        return False


class FakeImage:
    size = (640, 480)


class FakeScreenshot:
    def __init__(self):
        self.calls = 0

    def capture(self):
        self.calls += 1
        return FakeImage()


class FakeMouse:
    def __init__(self):
        self.calls = []

    def click(self, x, y, **kwargs):
        self.calls.append((x, y))


class FakePerception:
    def __init__(self, elements, available=True):
        self.elements = elements
        self.available = available
        self.calls = 0

    def perceive(self, image):
        self.calls += 1
        return {
            "analysis": None,
            "elements": self.elements,
            "analysis_available": False,
            "detection_available": self.available,
        }


def make_element(**overrides):
    values = {
        "element_id": "button-1",
        "element_type": "button",
        "label": "Continue",
        "bounds": BoundingBox(10, 20, 100, 40),
        "confidence": 0.95,
        "interactable": True,
        "metadata": {"source": "test_detector"},
    }
    values.update(overrides)
    return UIElement(**values)


def make_action(executor, **overrides):
    parameters = {
        "x": 20,
        "y": 30,
        "target_element_id": "button-1",
    }
    parameters.update(overrides)
    return executor.create_action("click", parameters)


def make_executor(elements=None, *, available=True, with_perception=True):
    mouse = FakeMouse()
    screenshot = FakeScreenshot()
    perception = (
        FakePerception(elements or [make_element()], available=available)
        if with_perception else None
    )
    executor = ComputerExecutor(
        mouse=mouse,
        screenshot=screenshot,
        perception=perception,
    )
    state = ComputerState(screen_size=ScreenSize(640, 480))
    return executor, mouse, screenshot, perception, state


def execute(executor, state, **parameters):
    return executor.execute(
        make_action(executor, **parameters),
        FakeContext(),
        state,
    )


def test_grounded_click_uses_fresh_detection_and_clicks_target():
    executor, mouse, screenshot, perception, state = make_executor()

    result = execute(executor, state)

    assert result.status == ComputerUseStatus.COMPLETED
    assert mouse.calls == [(20, 30)]
    assert screenshot.calls == 1
    assert perception.calls == 1


def test_legacy_coordinate_click_does_not_require_perception():
    executor, mouse, _, _, state = make_executor(with_perception=False)

    result = executor.execute(
        executor.create_action("click", {"x": 20, "y": 30}),
        FakeContext(),
        state,
    )

    assert result.status == ComputerUseStatus.COMPLETED
    assert mouse.calls == [(20, 30)]


def test_grounded_click_requires_perception_adapter():
    executor, mouse, _, _, state = make_executor(with_perception=False)

    with pytest.raises(ComputerActionError, match="screenshot and perception"):
        execute(executor, state)

    assert mouse.calls == []


def test_grounded_click_requires_available_detection():
    executor, mouse, _, _, state = make_executor(available=False)

    with pytest.raises(ComputerActionError, match="detections are unavailable"):
        execute(executor, state)

    assert mouse.calls == []


@pytest.mark.parametrize(
    "element,match",
    [
        (
            make_element(metadata={"source": "tesseract_ocr"}),
            "OCR text cannot authorize",
        ),
        (
            make_element(interactable=False),
            "not interactable",
        ),
        (
            make_element(confidence=0.49),
            "confidence is too low",
        ),
        (
            make_element(bounds=None),
            "no bounding box",
        ),
        (
            make_element(element_type="text"),
            "not a supported interactive control",
        ),
    ],
)
def test_rejects_untrusted_or_invalid_targets(element, match):
    executor, mouse, _, _, state = make_executor([element])

    with pytest.raises(ComputerActionError, match=match):
        execute(executor, state)

    assert mouse.calls == []


def test_rejects_click_outside_target_bounds():
    executor, mouse, _, _, state = make_executor()

    with pytest.raises(ComputerActionError, match="outside the target"):
        execute(executor, state, x=200, y=30)

    assert mouse.calls == []


def test_rejects_ambiguous_element_id():
    executor, mouse, _, _, state = make_executor(
        [make_element(), make_element()]
    )

    with pytest.raises(ComputerActionError, match="exactly one"):
        execute(executor, state)

    assert mouse.calls == []


def test_rejects_empty_target_id():
    executor, mouse, _, _, state = make_executor()

    with pytest.raises(ComputerActionError, match="non-empty string"):
        execute(executor, state, target_element_id=" ")

    assert mouse.calls == []


def test_rejects_target_element_id_for_non_click_action():
    executor, mouse, _, _, state = make_executor()
    action = executor.create_action(
        "type",
        {"text": "hello", "target_element_id": "button-1"},
    )

    with pytest.raises(ComputerActionError, match="only for click actions"):
        executor.execute(action, FakeContext(), state)

    assert mouse.calls == []