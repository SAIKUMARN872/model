from __future__ import annotations

from typing import Any

from .constants import ComputerUseStatus
from .exceptions import ComputerUseError
from .models import ComputerAction, ComputerSession, Screenshot, ScreenSize
from .session import ComputerSessionManager
from .state import ComputerStateManager
from .executor import ComputerExecutor


class ComputerController:
    """Coordinates session history, current state, and validated execution."""

    def __init__(
        self,
        executor: ComputerExecutor | None = None,
        sessions: ComputerSessionManager | None = None,
        state_manager: ComputerStateManager | None = None,
    ) -> None:
        self.state_manager = (
            state_manager
            or (sessions.state_manager if sessions is not None else None)
            or ComputerStateManager()
        )
        self.sessions = sessions or ComputerSessionManager(self.state_manager)
        if self.sessions.state_manager is not self.state_manager:
            raise ValueError(
                "Controller and session manager must share the same state manager."
            )
        self.executor = executor or ComputerExecutor()

    def create_session(self, session_id: str | None = None, metadata: dict | None = None):
        return self.sessions.create_session(session_id, metadata)

    def get_session(self, session_id: str) -> ComputerSession:
        return self.sessions.get_session(session_id)

    def execute_action(self, session_id: str, action: ComputerAction, context: Any) -> ComputerAction:
        session = self.sessions.get_session(session_id)
        if session.status == ComputerUseStatus.IDLE:
            self.sessions.start_session(session_id)
        elif session.status != ComputerUseStatus.RUNNING:
            raise ComputerUseError(
                f"Cannot execute actions in a {session.status.value} session."
            )

        try:
            result = self.executor.execute(action, context, session.state)
        except Exception:
            action.status = ComputerUseStatus.FAILED
            current_session = self.sessions.get_session(session_id)
            if any(item.action_id == action.action_id for item in current_session.actions):
                self.sessions.replace_action(session_id, action)
            else:
                self.sessions.add_action(session_id, action)
            raise

        current_session = self.sessions.get_session(session_id)
        if any(item.action_id == result.action_id for item in current_session.actions):
            self.sessions.replace_action(session_id, result)
        else:
            self.sessions.add_action(session_id, result)

        if (
            result.status == ComputerUseStatus.COMPLETED
            and result.action_type.lower() == "screenshot"
        ):
            screenshot_record = result.parameters.get("capture_result")
            if isinstance(screenshot_record, Screenshot):
                current = self.state_manager.get_state()
                metadata = dict(current.metadata)
                metadata["last_screenshot_action_id"] = result.action_id
                changes = {
                    "screen_size": ScreenSize(
                        screenshot_record.width, screenshot_record.height
                    ),
                    "screenshot": screenshot_record,
                    "metadata": metadata,
                }
                perception_result = result.parameters.get("perception_result")
                if isinstance(perception_result, dict):
                    if perception_result.get("detection_available"):
                        changes["ui_elements"] = perception_result.get("elements", [])
                    analysis = perception_result.get("analysis")
                    if analysis is not None:
                        metadata["last_screen_analysis"] = analysis
                    metadata["screen_analysis_available"] = bool(
                        perception_result.get("analysis_available")
                    )
                    metadata["ui_detection_available"] = bool(
                        perception_result.get("detection_available")
                    )
                changes["metadata"] = metadata
                self.state_manager.update(**changes)
                session_state = self.state_manager.get_state()
                session_state.status = self.sessions.get_session(session_id).status
                self.sessions.update_state(session_id, session_state)

        if result.status == ComputerUseStatus.WAITING_APPROVAL:
            self.sessions.update_status(
                session_id, ComputerUseStatus.WAITING_APPROVAL
            )
        return result

    def resume_approved_action(
        self, session_id: str, action: ComputerAction, context: Any
    ) -> ComputerAction:
        session = self.sessions.get_session(session_id)
        if session.status != ComputerUseStatus.WAITING_APPROVAL:
            raise ComputerUseError("Session is not waiting for approval.")
        if not callable(getattr(context, "has_approval", None)) or not context.has_approval(action.action_id):
            raise ComputerUseError("The context does not approve this action.")
        self.sessions.update_status(session_id, ComputerUseStatus.RUNNING)
        action.status = ComputerUseStatus.IDLE
        return self.execute_action(session_id, action, context)


