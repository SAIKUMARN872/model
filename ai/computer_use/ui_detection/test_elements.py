import pytest

from ai.computer_use.models import BoundingBox, UIElement
from ai.computer_use.ui_detection import normalize_element, normalize_elements


def test_normalizes_mapping_to_ui_element():
    result = normalize_element({
        "id": "button-1",
        "type": "Button",
        "text": "Submit",
        "bbox": [10, 20, 80, 30],
        "confidence": 0.9,
    }, screen_width=200, screen_height=100)

    assert isinstance(result, UIElement)
    assert result.element_id == "button-1"
    assert result.element_type == "button"
    assert result.label == "Submit"
    assert result.bounds == BoundingBox(10, 20, 80, 30)
    assert result.confidence == 0.9


def test_preserves_existing_ui_element():
    element = UIElement("e1", "button", bounds=BoundingBox(1, 2, 3, 4))
    assert normalize_element(element) is element


@pytest.mark.parametrize("bounds", [
    [-1, 0, 10, 10],
    [0, -1, 10, 10],
    [0, 0, 0, 10],
    [0, 0, 10, -1],
    [95, 0, 10, 10],
])
def test_rejects_invalid_or_out_of_screen_bounds(bounds):
    with pytest.raises(ValueError):
        normalize_element(
            {"type": "button", "bounds": bounds},
            screen_width=100,
            screen_height=100,
        )


@pytest.mark.parametrize("confidence", [-0.1, 1.1, True, "0.5", float("nan")])
def test_rejects_invalid_element_confidence(confidence):
    with pytest.raises(ValueError, match="confidence"):
        normalize_element({"type": "button", "confidence": confidence})


def test_normalizes_list_of_elements():
    result = normalize_elements([
        {"type": "button", "label": "Save"},
        {"type": "textbox", "label": "Name"},
    ])
    assert len(result) == 2
    assert result[0].element_id == "detected-0"
    assert result[1].element_id == "detected-1"


def test_rejects_non_list_detector_results():
    with pytest.raises(ValueError, match="list"):
        normalize_elements({"type": "button"})
