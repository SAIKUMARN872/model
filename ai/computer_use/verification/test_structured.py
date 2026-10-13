import pytest

from ai.computer_use.models import UIElement
from ai.computer_use.verification import StructuredEvidenceVerifier


@pytest.fixture
def verifier():
    return StructuredEvidenceVerifier()


@pytest.fixture
def observation():
    return {
        "analysis": {
            "summary": "Settings saved successfully",
            "visible_text": ["Profile updated", "Save complete"],
            "page_title": "Account Settings",
            "application": "ModelNow",
            "screen_type": "settings",
            "confidence": 0.95,
        },
        "elements": [
            UIElement(
                element_id="save-status",
                element_type="status",
                label="Save complete",
                confidence=0.98,
            )
        ],
        "analysis_available": True,
        "detection_available": True,
    }


def test_verifies_phrase_in_screen_summary(verifier, observation):
    assert verifier.verify("Settings saved successfully", observation)


def test_verifies_structured_expectations(verifier, observation):
    assert verifier.verify(
        {
            "summary_contains": "saved successfully",
            "page_title_contains": "Account Settings",
            "application_equals": "modelnow",
            "screen_type_equals": "settings",
            "element_label_visible": "Save complete",
        },
        observation,
    )


def test_rejects_text_not_present(verifier, observation):
    assert not verifier.verify("Payment completed", observation)


def test_rejects_negated_expected_phrase(verifier, observation):
    observation["analysis"]["summary"] = "Settings not saved successfully"
    assert not verifier.verify("saved successfully", observation)


def test_rejects_conflicting_evidence(verifier, observation):
    observation["analysis"]["summary"] = "Settings saved successfully"
    observation["analysis"]["visible_text"] = ["Settings not saved successfully"]
    assert not verifier.verify("saved successfully", observation)


@pytest.mark.parametrize("expected", [None, "", "   ", [], {}, 42])
def test_rejects_empty_or_malformed_expectation(verifier, observation, expected):
    assert not verifier.verify(expected, observation)


def test_rejects_unknown_structured_expectation_key(verifier, observation):
    assert not verifier.verify({"contains_magic": "yes"}, observation)


def test_rejects_missing_perception_sources(verifier, observation):
    observation["analysis_available"] = False
    observation["detection_available"] = False
    assert not verifier.verify("Settings saved successfully", observation)


def test_rejects_low_confidence_observation(verifier, observation):
    observation["analysis"]["confidence"] = 0.2
    assert not verifier.verify("Settings saved successfully", observation)


def test_rejects_malformed_visible_text(verifier, observation):
    observation["analysis"]["visible_text"] = "not-a-list"
    assert not verifier.verify("Settings saved successfully", observation)


def test_rejects_missing_element_label(verifier, observation):
    observation["elements"] = [{"id": "status"}]
    assert not verifier.verify({"element_label_visible": "Save complete"}, observation)


def test_verifies_visible_text_when_detection_is_unavailable(verifier, observation):
    observation["detection_available"] = False
    observation["elements"] = []
    assert verifier.verify("Settings saved successfully", observation)


def test_verifies_element_label_when_analysis_is_unavailable(verifier, observation):
    observation["analysis_available"] = False
    observation["analysis"] = None
    assert verifier.verify({"element_label_visible": "Save complete"}, observation)
