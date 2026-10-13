from ai.computer_use.visual_interface import VisualInterface, VisualPerception


class FakeCapture:
    def __init__(self):
        self.calls = 0

    def capture(self):
        self.calls += 1
        return object()


class FakeAnalyzer:
    def analyze(self, screenshot):
        return {"summary": "Test screen"}


class FakeDetector:
    def detect(self, screenshot):
        return [{"element_id": "x1", "label": "Continue"}]


def test_observe_captures_and_combines_perception():
    capture = FakeCapture()
    interface = VisualInterface(
        screenshot_capture=capture,
        perception=VisualPerception(FakeAnalyzer(), FakeDetector()),
    )

    result = interface.observe(
        screenshot_id="shot-1", screen_width=800, screen_height=600
    )

    assert capture.calls == 1
    assert result["analysis"]["summary"] == "Test screen"
    assert result["elements"][0]["label"] == "Continue"
    assert result["screenshot"].screenshot_id == "shot-1"
    assert result["screenshot"].width == 800
    assert result["screenshot"].height == 600


def test_observe_accepts_existing_screenshot_without_recapturing():
    capture = FakeCapture()
    image = object()
    interface = VisualInterface(screenshot_capture=capture)

    result = interface.observe(screenshot=image)

    assert capture.calls == 0
    assert result["analysis"] is None
    assert result["elements"] == []


def test_analyze_and_detect_convenience_methods():
    interface = VisualInterface(
        screenshot_capture=FakeCapture(),
        perception=VisualPerception(FakeAnalyzer(), FakeDetector()),
    )
    assert interface.analyze(object()) == {"summary": "Test screen"}
    assert interface.detect(object())[0]["label"] == "Continue"
