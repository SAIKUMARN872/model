import pytest

from ai.computer_use.models import ScreenSize
from ai.computer_use.coordinate_mapping import CoordinateMapper
from ai.computer_use.mouse import MouseActions
from ai.computer_use.keyboard import KeyboardActions
from ai.computer_use.screenshot import ScreenshotCapture, ScreenshotManager


class FakeMouse:
    def __init__(self):
        self.calls = []

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


class FakeKeyboard:
    def __init__(self):
        self.calls = []

    def write(self, *args, **kwargs):
        self.calls.append(("write", args, kwargs))

    def press(self, *args, **kwargs):
        self.calls.append(("press", args, kwargs))

    def hotkey(self, *args, **kwargs):
        self.calls.append(("hotkey", args, kwargs))


class FakeImage:
    size = (800, 600)

    def save(self, path):
        self.saved_path = path


class FakeCaptureBackend:
    def __init__(self):
        self.image = FakeImage()
        self.calls = 0

    def screenshot(self):
        self.calls += 1
        return self.image


def test_coordinate_mapping_round_trip():
    mapper = CoordinateMapper(ScreenSize(width=1920, height=1080))
    point = mapper.to_screen(1.0, 1.0)
    assert (point.x, point.y) == (1919, 1079)
    assert mapper.to_normalized(1919, 1079) == (1.0, 1.0)


def test_coordinate_mapping_rejects_out_of_range():
    mapper = CoordinateMapper(ScreenSize(width=100, height=100))
    with pytest.raises(ValueError):
        mapper.to_screen(1.5, 0.5)


def test_mouse_click_dispatches_to_fake_backend():
    backend = FakeMouse()
    MouseActions(backend).click(20, 30)
    assert backend.calls == [
        ("click", (), {"x": 20, "y": 30, "button": "left"})
    ]


def test_mouse_drag_dispatches_to_fake_backend():
    backend = FakeMouse()
    MouseActions(backend).drag(1, 2, 10, 20)
    assert backend.calls[0][0] == "moveTo"
    assert backend.calls[1][0] == "dragTo"


def test_mouse_rejects_invalid_button():
    with pytest.raises(ValueError):
        MouseActions(FakeMouse()).click(1, 2, button="invalid")


def test_keyboard_types_text():
    backend = FakeKeyboard()
    KeyboardActions(backend).type_text("ModelNow")
    assert backend.calls[0][0] == "write"
    assert backend.calls[0][1] == ("ModelNow",)


def test_keyboard_press_and_hotkey():
    backend = FakeKeyboard()
    keyboard = KeyboardActions(backend)
    keyboard.press("enter")
    keyboard.hotkey("ctrl", "s")
    assert backend.calls[0][0] == "press"
    assert backend.calls[1] == ("hotkey", ("ctrl", "s"), {})


def test_keyboard_rejects_empty_key():
    with pytest.raises(ValueError):
        KeyboardActions(FakeKeyboard()).press("")


def test_screenshot_capture_uses_fake_backend():
    backend = FakeCaptureBackend()
    image = ScreenshotCapture(backend).capture()
    assert image.size == (800, 600)
    assert backend.calls == 1


def test_screenshot_manager_returns_metadata():
    backend = FakeCaptureBackend()
    manager = ScreenshotManager(ScreenshotCapture(backend))
    result = manager.capture(image_format="png")
    assert result.width == 800
    assert result.height == 600
    assert result.format == "png"
    assert result.screenshot_id
    assert manager.get_last_image().size == (800, 600)


def test_screenshot_capture_saves_to_requested_path():
    backend = FakeCaptureBackend()
    ScreenshotCapture(backend).capture("fake-screen.png")
    assert backend.image.saved_path == "fake-screen.png"
