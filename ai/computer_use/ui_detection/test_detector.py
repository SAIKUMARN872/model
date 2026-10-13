import pytest

from ai.computer_use.exceptions import ComputerActionError
from ai.computer_use.ui_detection import UIElementDetector


class FakeDetectorBackend:
    def detect(self, screenshot):
        return [{
            "id": "save",
            "type": "button",
            "label": "Save",
            "bounds": {"x": 10, "y": 20, "width": 50, "height": 25},
            "confidence": 0.95,
        }]


def test_detector_returns_normalized_dictionary_results():
    result = UIElementDetector(
        FakeDetectorBackend(), screen_width=100, screen_height=100
    ).detect(object())

    assert result[0]["element_id"] == "save"
    assert result[0]["element_type"] == "button"
    assert result[0]["bounds"]["x"] == 10


def test_detector_can_return_ui_element_models():
    result = UIElementDetector(FakeDetectorBackend()).detect_elements(object())
    assert result[0].label == "Save"


def test_detector_requires_backend():
    with pytest.raises(ComputerActionError, match="injected detector"):
        UIElementDetector().detect(object())


def test_detector_wraps_backend_failure():
    class Backend:
        def detect(self, screenshot):
            raise RuntimeError("backend detail")

    with pytest.raises(ComputerActionError, match="detection failed"):
        UIElementDetector(Backend()).detect(object())


def test_detector_rejects_out_of_bounds_detection():
    with pytest.raises(ComputerActionError, match="detection failed"):
        UIElementDetector(
            FakeDetectorBackend(), screen_width=20, screen_height=100
        ).detect(object())
