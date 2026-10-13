import pytest

from ai.computer_use.exceptions import ComputerActionError
from ai.computer_use.visual_interface import VisualPerception


class FakeAnalyzer:
    def analyze(self, screenshot):
        return {"summary": "Desktop"}


class FakeDetector:
    def detect(self, screenshot):
        return [{"element_id": "b1", "label": "OK"}]


def test_perception_combines_analysis_and_detection():
    screenshot = object()
    result = VisualPerception(FakeAnalyzer(), FakeDetector()).perceive(screenshot)
    assert result["analysis"] == {"summary": "Desktop"}
    assert result["elements"] == [{"element_id": "b1", "label": "OK"}]
    assert result["analysis_available"] is True
    assert result["detection_available"] is True


def test_perception_reports_unconfigured_backends_without_fabricating_results():
    result = VisualPerception().perceive(object())
    assert result["analysis"] is None
    assert result["elements"] == []
    assert result["analysis_available"] is False
    assert result["detection_available"] is False


def test_perception_rejects_missing_screenshot():
    with pytest.raises(ValueError, match="screenshot"):
        VisualPerception().perceive(None)


def test_perception_rejects_invalid_analyzer_result():
    class Analyzer:
        def analyze(self, screenshot):
            return ["not a mapping"]

    with pytest.raises(ComputerActionError, match="dictionary"):
        VisualPerception(Analyzer()).perceive(object())


def test_perception_rejects_invalid_detector_result():
    class Detector:
        def detect(self, screenshot):
            return {"not": "a list"}

    with pytest.raises(ComputerActionError, match="list"):
        VisualPerception(detector=Detector()).perceive(object())
