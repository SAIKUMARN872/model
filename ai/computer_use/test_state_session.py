import pytest

from ai.computer_use.constants import ComputerUseStatus
from ai.computer_use.exceptions import ComputerUseError
from ai.computer_use.models import ComputerAction, ComputerState
from ai.computer_use.session import ComputerSessionManager
from ai.computer_use.state import ComputerStateManager
from ai.computer_use.utils import generate_id


def test_state_manager_returns_isolated_snapshots():
    manager = ComputerStateManager()
    snapshot = manager.get_state()
    snapshot.metadata["outside"] = True
    assert "outside" not in manager.get_state().metadata


def test_state_manager_updates_and_resets_status():
    manager = ComputerStateManager()
    manager.update_status(ComputerUseStatus.RUNNING)
    assert manager.get_state().status == ComputerUseStatus.RUNNING
    assert manager.reset().status == ComputerUseStatus.IDLE


def test_state_manager_rejects_unknown_fields():
    with pytest.raises(ValueError):
        ComputerStateManager().update(unexpected=True)


def test_session_lifecycle_and_action_history():
    manager = ComputerSessionManager()
    session = manager.create_session(metadata={"source": "test"})
    started = manager.start_session(session.session_id)
    assert started.status == ComputerUseStatus.RUNNING
    assert started.started_at is not None

    action = ComputerAction(
        action_id=generate_id("action"),
        action_type="screenshot",
    )
    updated = manager.add_action(session.session_id, action)
    assert len(updated.actions) == 1

    completed = manager.complete_session(session.session_id)
    assert completed.status == ComputerUseStatus.COMPLETED
    assert completed.ended_at is not None


def test_session_rejects_duplicate_ids_and_unknown_sessions():
    manager = ComputerSessionManager()
    manager.create_session("fixed")
    with pytest.raises(ComputerUseError):
        manager.create_session("fixed")
    with pytest.raises(ComputerUseError):
        manager.get_session("missing")


def test_cancelled_session_cannot_accept_actions():
    manager = ComputerSessionManager()
    session = manager.create_session()
    manager.cancel_session(session.session_id)
    with pytest.raises(ComputerUseError):
        manager.add_action(
            session.session_id,
            ComputerAction(action_id="action-1", action_type="click"),
        )


def test_session_state_is_updated_independently():
    manager = ComputerSessionManager()
    session = manager.create_session()
    state = ComputerState(status=ComputerUseStatus.VERIFYING)
    updated = manager.update_state(session.session_id, state)
    assert updated.state.status == ComputerUseStatus.VERIFYING
    assert manager.get_session(session.session_id).status == ComputerUseStatus.IDLE
