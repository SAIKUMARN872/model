import pytest

from ai.computer_use import Computer, ComputerUseError
from ai.computer_use.models import ComputerUseStatus


class FakeDesktop:
    def __init__(self):
        self.initialized = False
        self.initialize_calls = 0
        self.shutdown_calls = 0

    def initialize(self):
        self.initialized = True
        self.initialize_calls += 1

    def shutdown(self):
        self.initialized = False
        self.shutdown_calls += 1

    def get_state(self):
        return {"backend": "fake", "ready": self.initialized}


def test_computer_lifecycle_and_state():
    desktop = FakeDesktop()
    computer = Computer(desktop=desktop)

    computer.initialize()
    computer.initialize()

    assert computer.initialized is True
    assert desktop.initialize_calls == 1
    assert computer.get_state()["desktop"]["ready"] is True

    computer.shutdown()
    computer.shutdown()

    assert computer.initialized is False
    assert desktop.shutdown_calls == 1


def test_computer_requires_initialization_for_sessions():
    computer = Computer()

    with pytest.raises(ComputerUseError, match="not initialized"):
        computer.create_session()


def test_computer_creates_and_retrieves_session():
    computer = Computer()
    computer.initialize()

    session = computer.create_session("facade-session", {"source": "test"})

    assert session.session_id == "facade-session"
    assert computer.get_session("facade-session").session_id == session.session_id


def test_computer_without_desktop_supports_managed_state():
    computer = Computer()
    computer.initialize()

    state = computer.get_state()

    assert state["initialized"] is True
    assert state["desktop"] == {}
    assert state["managed_state"].status == ComputerUseStatus.IDLE
