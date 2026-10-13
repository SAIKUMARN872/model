from __future__ import annotations

import pytest

from ai.computer_use.constants import ComputerUseStatus, VerificationStatus
from ai.computer_use.exceptions import ComputerActionError
from ai.computer_use.executor import ComputerExecutor
from ai.computer_use.models import ComputerState, ScreenSize


class FakeContext:
    def has_permission(self, permission: str) -> bool:
        return permission == "computer:execute"

    def has_approval(self, action_id: str) -> bool:
        return False


class FakeMouse:
    def __init__(self):
        self.clicks = []

    def click(self, x: int, y: int) -> None:
        self.clicks.append((x, y))


class FakeImage:
    size = (640, 480)


class FakeScreenshot:
    def __init__(self):
        self.calls = 0
        self.image = FakeImage()

    def capture(self):
        self.calls += 1
        return self.image


class FakePerception:
    def __init__(self):
        self.calls = 0
        self.observation = {
            "analysis": {"summary": "Button is visible"},
            "elements": [],
            "analysis_available": True,
            "detection_available": True,
        }

    def perceive(self, screenshot):
        self.calls += 1
        return self.observation


class FakeVerifier:
    def __init__(self, result: bool):
        self.result = result
        self.calls = []

    def verify(self, expected, actual) -> bool:
        self.calls.append((expected, actual))
        return self.result


def make_executor(result: bool):
    screenshot = FakeScreenshot()
    perception = FakePerception()
    verifier = FakeVerifier(result)
    executor = ComputerExecutor(
        mouse=FakeMouse(),
        screenshot=screenshot,
        perception=perception,
        verification=verifier,
    )
    state = ComputerState(screen_size=ScreenSize(width=640, height=480))
    return executor, screenshot, perception, verifier, state


def test_expected_outcome_verifies_success_with_one_capture_and_perception():
    executor, screenshot, perception, verifier, state = make_executor(True)
    action = executor.create_action(
        "click",
        {"x": 20, "y": 30, "expected_outcome": "Button activated"},
    )

    result = executor.execute(action, FakeContext(), state)

    assert result.status == ComputerUseStatus.COMPLETED
    verification = result.parameters["verification_result"]
    assert verification["status"] == VerificationStatus.PASSED.value
    assert verification["success"] is True
    assert len(verifier.calls) == 1
    assert screenshot.calls == 1
    assert perception.calls == 1


def test_expected_outcome_verification_failure_fails_action():
    executor, screenshot, perception, verifier, state = make_executor(False)
    action = executor.create_action(
        "click",
        {"x": 20, "y": 30, "expected_outcome": "Button activated"},
    )

    with pytest.raises(ComputerActionError, match="verification failed"):
        executor.execute(action, FakeContext(), state)

    assert action.status == ComputerUseStatus.FAILED
    verification = action.parameters["verification_result"]
    assert verification["status"] == VerificationStatus.FAILED.value
    assert verification["success"] is False
    assert len(verifier.calls) == 1
    assert screenshot.calls == 1
    assert perception.calls == 1


def test_action_without_expected_outcome_skips_verification():
    executor, screenshot, perception, verifier, state = make_executor(True)
    action = executor.create_action("click", {"x": 20, "y": 30})

    result = executor.execute(action, FakeContext(), state)

    assert result.status == ComputerUseStatus.COMPLETED
    assert "verification_result" not in result.parameters
    assert verifier.calls == []
    assert screenshot.calls == 0
    assert perception.calls == 0

def test_missing_verifier_fails_expected_outcome_action():
    executor, screenshot, perception, _, state = make_executor(True)
    executor.verification = None
    action = executor.create_action(
        "click",
        {"x": 20, "y": 30, "expected_outcome": "Button activated"},
    )

    with pytest.raises(ComputerActionError, match="no verifier is configured"):
        executor.execute(action, FakeContext(), state)

    assert action.status == ComputerUseStatus.FAILED
    record = action.parameters["verification_result"]
    assert record["status"] == VerificationStatus.FAILED.value
    assert record["success"] is False
    assert screenshot.calls == 1
    assert perception.calls == 1


def test_missing_perception_evidence_fails_expected_outcome_action():
    executor, screenshot, _, verifier, state = make_executor(True)
    executor.perception = None
    action = executor.create_action(
        "click",
        {"x": 20, "y": 30, "expected_outcome": "Button activated"},
    )

    with pytest.raises(ComputerActionError, match="visual evidence is unavailable"):
        executor.execute(action, FakeContext(), state)

    assert action.status == ComputerUseStatus.FAILED
    record = action.parameters["verification_result"]
    assert record["status"] == VerificationStatus.FAILED.value
    assert record["success"] is False
    assert verifier.calls == []
    assert screenshot.calls == 0


def test_missing_expected_outcome_value_fails_closed():
    executor, _, _, _, state = make_executor(True)
    action = executor.create_action(
        "click",
        {"x": 20, "y": 30, "expected_outcome": None},
    )

    with pytest.raises(ComputerActionError, match="expected_outcome is missing"):
        executor.execute(action, FakeContext(), state)

    assert action.status == ComputerUseStatus.FAILED
    record = action.parameters["verification_result"]
    assert record["status"] == VerificationStatus.FAILED.value
    assert record["success"] is False

