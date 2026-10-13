import pytest

from ai.computer_use.exceptions import ComputerActionError
from ai.computer_use.screen_understanding import ScreenAnalyzer


class FakeVisionBackend:
    def analyze(self, screenshot):
        return {"summary": "Settings page", "screen_type": "settings"}


def test_analyzer_uses_injected_backend():
    screenshot = object()
    result = ScreenAnalyzer(FakeVisionBackend()).analyze(screenshot)
    assert result["summary"] == "Settings page"
    assert result["screen_type"] == "settings"


def test_analyzer_rejects_missing_screenshot():
    with pytest.raises(ValueError, match="screenshot"):
        ScreenAnalyzer(FakeVisionBackend()).analyze(None)


def test_analyzer_requires_backend():
    with pytest.raises(ComputerActionError, match="injected vision backend"):
        ScreenAnalyzer().analyze(object())


def test_analyzer_rejects_non_dictionary_result():
    class Backend:
        def analyze(self, screenshot):
            return "not structured"

    with pytest.raises(ComputerActionError, match="dictionary"):
        ScreenAnalyzer(Backend()).analyze(object())


def test_analyzer_wraps_backend_failure():
    class Backend:
        def analyze(self, screenshot):
            raise RuntimeError("internal detail")

    with pytest.raises(ComputerActionError, match="Screen analysis failed"):
        ScreenAnalyzer(Backend()).analyze(object())
