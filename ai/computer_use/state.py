from __future__ import annotations

from copy import deepcopy
from threading import RLock

from .constants import ComputerUseStatus
from .exceptions import ComputerUseError
from .models import ComputerState


class ComputerStateManager:
    """Thread-safe owner of the latest Computer Use state."""

    def __init__(self, initial_state: ComputerState | None = None) -> None:
        self._lock = RLock()
        self._state = deepcopy(initial_state or ComputerState())

    def get_state(self) -> ComputerState:
        with self._lock:
            return deepcopy(self._state)

    def replace_state(self, state: ComputerState) -> ComputerState:
        if not isinstance(state, ComputerState):
            raise TypeError("state must be a ComputerState instance.")
        with self._lock:
            self._state = deepcopy(state)
            return deepcopy(self._state)

    def update_status(self, status: ComputerUseStatus) -> ComputerState:
        if not isinstance(status, ComputerUseStatus):
            raise TypeError("status must be a ComputerUseStatus value.")
        with self._lock:
            self._state.status = status
            return deepcopy(self._state)

    def update(self, **changes: object) -> ComputerState:
        allowed = {
            "screen_size",
            "active_application",
            "active_window",
            "ui_elements",
            "screenshot",
            "metadata",
        }
        unknown = set(changes) - allowed
        if unknown:
            raise ValueError(
                f"Unsupported state fields: {', '.join(sorted(unknown))}"
            )
        with self._lock:
            for name, value in changes.items():
                setattr(self._state, name, deepcopy(value))
            return deepcopy(self._state)

    def reset(self) -> ComputerState:
        with self._lock:
            self._state = ComputerState()
            return deepcopy(self._state)


# Short alias for callers that prefer the simpler name.
StateManager = ComputerStateManager
