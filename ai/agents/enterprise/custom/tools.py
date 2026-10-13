from threading import RLock
from uuid import uuid4
from typing import Any

from .schemas import (
    CustomCase,
    CustomStatus,
    WorkflowDefinition,
    require_mapping,
    require_text,
)


class CustomTools:
    """Process-local workflow definitions and case records."""

    def __init__(self):
        self._lock = RLock()
        self.workflows: dict[str, WorkflowDefinition] = {}
        self.cases: dict[str, CustomCase] = {}

    def define_workflow(
        self,
        name: str,
        steps: list[str],
        requires_approval: bool = False,
    ) -> dict[str, Any]:
        name = require_text(name, "name")
        if not isinstance(steps, (list, tuple)):
            raise ValueError("steps must be a list or tuple")
        definition = WorkflowDefinition(
            name=name,
            steps=tuple(steps),
            requires_approval=bool(requires_approval),
        )
        with self._lock:
            if name in self.workflows:
                raise ValueError(f"Workflow already exists: {name}")
            self.workflows[name] = definition
        return self._definition_dict(definition)

    def create_case(
        self,
        workflow_name: str,
        title: str,
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        workflow_name = require_text(workflow_name, "workflow_name")
        title = require_text(title, "title")
        case_data = require_mapping(data, "data")
        with self._lock:
            if workflow_name not in self.workflows:
                raise ValueError(f"Unknown workflow: {workflow_name}")
            case = CustomCase(
                case_id=str(uuid4()),
                workflow_name=workflow_name,
                title=title,
                data=case_data,
            )
            case.history.append({
                "event": "case_created",
                "status": case.status.value,
            })
            self.cases[case.case_id] = case
            return self._case_dict(case)

    def advance_case(
        self,
        case_id: str,
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        case_id = require_text(case_id, "case_id")
        updates = require_mapping(data, "data")
        with self._lock:
            case = self._get_case(case_id)
            if case.status != CustomStatus.ACTIVE:
                raise ValueError(
                    f"Case cannot advance while status is {case.status.value}"
                )
            definition = self.workflows[case.workflow_name]

            if definition.requires_approval:
                case.pending_approval = True
                case.status = CustomStatus.AWAITING_APPROVAL
                case.history.append({"event": "approval_requested"})
                return self._case_dict(case)

            return self._complete_next_step(case, updates, definition)

    def decide_approval(
        self,
        case_id: str,
        approved: bool,
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        case_id = require_text(case_id, "case_id")
        if not isinstance(approved, bool):
            raise ValueError("approved must be a boolean")
        updates = require_mapping(data, "data")
        with self._lock:
            case = self._get_case(case_id)
            if case.status != CustomStatus.AWAITING_APPROVAL:
                raise ValueError("Case is not awaiting approval")

            case.pending_approval = False
            case.history.append({
                "event": "approval_decided",
                "approved": approved,
            })
            if not approved:
                case.status = CustomStatus.CANCELLED
                return self._case_dict(case)

            case.status = CustomStatus.ACTIVE
            definition = self.workflows[case.workflow_name]
            return self._complete_next_step(case, updates, definition)

    def cancel_case(self, case_id: str) -> dict[str, Any]:
        with self._lock:
            case = self._get_case(require_text(case_id, "case_id"))
            if case.status in (CustomStatus.COMPLETED, CustomStatus.CANCELLED):
                raise ValueError("Case is already closed")
            case.status = CustomStatus.CANCELLED
            case.pending_approval = False
            case.history.append({"event": "case_cancelled"})
            return self._case_dict(case)

    def get_case(self, case_id: str) -> dict[str, Any]:
        with self._lock:
            return self._case_dict(self._get_case(
                require_text(case_id, "case_id")
            ))

    def list_cases(self) -> list[dict[str, Any]]:
        with self._lock:
            return [self._case_dict(case) for case in self.cases.values()]

    def _complete_next_step(
        self,
        case: CustomCase,
        updates: dict[str, Any],
        definition: WorkflowDefinition,
    ) -> dict[str, Any]:
        if updates:
            case.data.update(updates)

        next_index = len(case.completed_steps)
        if next_index >= len(definition.steps):
            case.status = CustomStatus.COMPLETED
            return self._case_dict(case)

        step = definition.steps[next_index]
        case.completed_steps.append(step)
        case.history.append({"event": "step_completed", "step": step})

        if len(case.completed_steps) == len(definition.steps):
            case.status = CustomStatus.COMPLETED

        return self._case_dict(case)

    def _get_case(self, case_id: str) -> CustomCase:
        try:
            return self.cases[case_id]
        except KeyError as exc:
            raise ValueError(f"Unknown case: {case_id}") from exc

    @staticmethod
    def _definition_dict(definition: WorkflowDefinition) -> dict[str, Any]:
        return {
            "name": definition.name,
            "steps": list(definition.steps),
            "requires_approval": definition.requires_approval,
        }

    @staticmethod
    def _case_dict(case: CustomCase) -> dict[str, Any]:
        return {
            "case_id": case.case_id,
            "workflow_name": case.workflow_name,
            "title": case.title,
            "data": dict(case.data),
            "status": case.status.value,
            "completed_steps": list(case.completed_steps),
            "pending_approval": case.pending_approval,
            "history": [dict(event) for event in case.history],
        }
