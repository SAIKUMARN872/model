import pytest

from ai.computer_use.screen_understanding import ScreenObservationParser


def test_parser_preserves_valid_observation():
    source = {
        "summary": "Login page",
        "visible_text": ["Email", "Password"],
        "confidence": 0.92,
    }
    result = ScreenObservationParser().parse(source)
    assert result == source
    assert result is not source
    assert result["visible_text"] is not source["visible_text"]


@pytest.mark.parametrize("observation", [None, [], "screen", 5])
def test_parser_rejects_non_mapping(observation):
    with pytest.raises(ValueError, match="dictionary"):
        ScreenObservationParser().parse(observation)


@pytest.mark.parametrize("confidence", [-0.1, 1.1, True, "high", float("nan")])
def test_parser_rejects_invalid_confidence(confidence):
    with pytest.raises(ValueError, match="confidence"):
        ScreenObservationParser().parse({"confidence": confidence})


def test_parser_rejects_invalid_visible_text():
    with pytest.raises(ValueError, match="visible_text"):
        ScreenObservationParser().parse({"visible_text": ["OK", 3]})


def test_parser_rejects_non_text_summary():
    with pytest.raises(ValueError, match="summary"):
        ScreenObservationParser().parse({"summary": 123})
