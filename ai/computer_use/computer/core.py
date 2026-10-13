from __future__ import annotations

from typing import Any

from ..controller import ComputerController
from ..exceptions import ComputerUseError
from ..interfaces import ComputerInterface
from ..models import ComputerAction, ComputerSession


class Computer(ComputerInterface):
    """Public facade for desktop lifecycle and controlled computer actions.

    Desktop interaction is supplied through an injected backend. Action
    execution remains delegated to ComputerController and ComputerExecutor,
    preserving their validation and approval requirements.
    """

    def __init__(
        self,
        desktop: ComputerInterface | None = None,
        controller: ComputerController | None = None,
    ) -> None:
        self.desktop = desktop
        self.controller = controller or ComputerController()
        self._initialized = False

    @property
    def initialized(self) -> bool:
        return self._initialized

    def initialize(self) -> None:
        if self._initialized:
            return

        if self.desktop is not None:
            try:
                self.desktop.initialize()
            except Exception as exc:
                raise ComputerUseError(
                    f"Computer initialization failed: {exc}"
                ) from exc

        self._initialized = True

    def shutdown(self) -> None:
        if not self._initialized:
            return

        if self.desktop is not None:
            try:
                self.desktop.shutdown()
            except Exception as exc:
                raise ComputerUseError(
                    f"Computer shutdown failed: {exc}"
                ) from exc

        self._initialized = False

    def get_state(self) -> dict[str, Any]:
        desktop_state: dict[str, Any] = {}

        if self.desktop is not None:
            try:
                result = self.desktop.get_state()
            except Exception as exc:
                raise ComputerUseError(
                    f"Could not retrieve desktop state: {exc}"
                ) from exc

            if not isinstance(result, dict):
                raise ComputerUseError(
                    "Desktop backend get_state() must return a dictionary."
                )
            desktop_state = result

        return {
            "initialized": self._initialized,
            "desktop": desktop_state,
            "managed_state": self.controller.state_manager.get_state(),
        }

    def _require_initialized(self) -> None:
        if not self._initialized:
            raise ComputerUseError(
                "Computer is not initialized. Call initialize() first."
            )

    def create_session(
        self,
        session_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> ComputerSession:
        self._require_initialized()
        return self.controller.create_session(session_id, metadata)

    def get_session(self, session_id: str) -> ComputerSession:
        self._require_initialized()
        return self.controller.get_session(session_id)

    def execute_action(
        self,
        session_id: str,
        action: ComputerAction,
        context: Any,
    ) -> ComputerAction:
        self._require_initialized()
        return self.controller.execute_action(session_id, action, context)

    def resume_approved_action(
        self,
        session_id: str,
        action: ComputerAction,
        context: Any,
    ) -> ComputerAction:
        self._require_initialized()
        return self.controller.resume_approved_action(
            session_id, action, context
        )
