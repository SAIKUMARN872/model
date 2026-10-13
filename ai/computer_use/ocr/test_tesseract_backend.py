from types import SimpleNamespace

import pytest

from ai.computer_use.exceptions import ComputerActionError
from ai.computer_use.ocr import TesseractOCRBackend


class FakeOCREngine:
    Output = SimpleNamespace(DICT="dict")

    def __init__(self, data=None):
        self.data = data or {
            "text": ["", "Save", "Changes"],
            "conf": ["-1", "96", "80"],
            "left": ["0", "10", "55"],
            "top": ["0", "20", "20"],
            "width": ["0", "35", "60"],
            "height": ["0", "14", "14"],
        }
        self.calls = []

    def image_to_data(self, image, *, output_type):
        self.calls.append((image, output_type))
        return self.data


def test_analyze_returns_screen_observation():
    engine = FakeOCREngine()
    backend = TesseractOCRBackend(engine=engine)

    result = backend.analyze("fake-screen.png")

    assert result["summary"] == "Save Changes"
    assert result["visible_text"] == ["Save", "Changes"]
    assert 0.0 <= result["confidence"] <= 1.0
    assert result["source"] == "tesseract_ocr"


def test_detect_returns_normalized_text_regions():
    backend = TesseractOCRBackend(engine=FakeOCREngine())

    elements = backend.detect("fake-screen.png")

    assert len(elements) == 2
    assert elements[0]["label"] == "Save"
    assert elements[0]["element_type"] == "text"
    assert elements[0]["bounds"] == {
        "x": 10, "y": 20, "width": 35, "height": 14
    }
    assert elements[0]["interactable"] is False
    assert elements[0]["metadata"]["source"] == "tesseract_ocr"


def test_confidence_threshold_filters_low_confidence_text():
    backend = TesseractOCRBackend(
        engine=FakeOCREngine(), min_confidence=0.9
    )

    elements = backend.detect("fake-screen.png")

    assert [item["label"] for item in elements] == ["Save"]


@pytest.mark.parametrize("value", [-0.1, 1.1, True, "0.5"])
def test_rejects_invalid_confidence_threshold(value):
    with pytest.raises(ValueError):
        TesseractOCRBackend(engine=FakeOCREngine(), min_confidence=value)


def test_rejects_inconsistent_ocr_result_lengths():
    data = {
        "text": ["Save"],
        "conf": ["90"],
        "left": [10],
        "top": [20],
        "width": [30],
        "height": [],
    }
    backend = TesseractOCRBackend(engine=FakeOCREngine(data))

    with pytest.raises(ComputerActionError, match="inconsistent lengths"):
        backend.detect("fake-screen.png")


def test_rejects_non_dictionary_ocr_result():
    class InvalidEngine:
        def image_to_data(self, image, *, output_type):
            return []

    backend = TesseractOCRBackend(engine=InvalidEngine())

    with pytest.raises(ComputerActionError, match="dictionary"):
        backend.analyze("fake-screen.png")


def test_rejects_none_screenshot():
    backend = TesseractOCRBackend(engine=FakeOCREngine())

    with pytest.raises(ValueError, match="screenshot"):
        backend.analyze(None)


def test_supports_screenshot_object_with_path():
    backend = TesseractOCRBackend(engine=FakeOCREngine())
    screenshot = SimpleNamespace(path="fake-screen.png")

    result = backend.analyze(screenshot)

    assert result["visible_text"] == ["Save", "Changes"]

def test_ocr_normalizes_whitespace():
    data = {
        "text": ["  Save   ", "Changes\tNow"],
        "conf": ["95", "90"],
        "left": [10, 50],
        "top": [20, 20],
        "width": [30, 60],
        "height": [14, 14],
    }
    backend = TesseractOCRBackend(engine=FakeOCREngine(data))
    result = backend.analyze("fake-screen.png")
    assert result["visible_text"] == ["Save", "Changes Now"]
    assert result["summary"] == "Save Changes Now"


def test_tesseract_text_never_becomes_interactable():
    from ai.computer_use.ui_detection.elements import normalize_element

    element = normalize_element({
        "element_id": "ocr-save",
        "element_type": "text",
        "label": "Save",
        "bounds": {"x": 10, "y": 20, "width": 40, "height": 15},
        "confidence": 0.99,
        "interactable": True,
        "metadata": {"source": "tesseract_ocr"},
    })
    assert element.interactable is False


def test_tesseract_text_defaults_to_non_interactable():
    from ai.computer_use.ui_detection.elements import normalize_element

    element = normalize_element({
        "element_id": "ocr-submit",
        "element_type": "text",
        "label": "Submit",
        "bounds": {"x": 10, "y": 20, "width": 50, "height": 15},
        "confidence": 0.95,
        "metadata": {"source": "tesseract_ocr"},
    })
    assert element.interactable is False

