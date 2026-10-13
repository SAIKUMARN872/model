from __future__ import annotations

from typing import Any

from .schemas import CRMStage, CRMStatus, CRMWorkflowState
from .tools import CRMTools


class CRMWorkflow:
    """Runs one explicit CRM action at a time; no automatic financial execution."""

    ACTION_STAGE = {
        "create_customer": CRMStage.CUSTOMER,
        "create_lead": CRMStage.LEAD,
        "qualify_lead": CRMStage.QUALIFICATION,
        "create_opportunity": CRMStage.OPPORTUNITY,
        "assign_sales_representative": CRMStage.SALES_ASSIGNMENT,
        "schedule_follow_up": CRMStage.FOLLOW_UP,
        "arrange_test_drive": CRMStage.TEST_DRIVE,
        "generate_quotation": CRMStage.QUOTATION,
        "negotiation": CRMStage.NEGOTIATION,
        "request_approval": CRMStage.APPROVAL,
        "record_approval_decision": CRMStage.APPROVAL,
        "booking": CRMStage.BOOKING,
        "payment": CRMStage.PAYMENT,
        "invoice": CRMStage.INVOICE,
        "delivery": CRMStage.DELIVERY,
    }

    def __init__(self, tools: CRMTools | None = None) -> None:
        self.tools = tools or CRMTools()
        self.states: dict[str, CRMWorkflowState] = {}

    def execute(self, action: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(action, str) or action not in self.ACTION_STAGE:
            raise ValueError(f"Unsupported CRM action: {action}")
        if not isinstance(payload, dict):
            raise ValueError("CRM payload must be an object")

        dispatch = {
            "create_customer": self.tools.create_customer,
            "create_lead": self.tools.create_lead,
            "qualify_lead": self.tools.qualify_lead,
            "create_opportunity": self.tools.create_opportunity,
        }
        if action in dispatch:
            result = dispatch[action](payload)
        else:
            result = self.tools.record_activity(action, payload)

        workflow_id = str(payload.get("workflow_id", "default"))
        state = self.states.setdefault(workflow_id, CRMWorkflowState(workflow_id))
        stage = self.ACTION_STAGE[action]
        state.current_stage = stage
        state.completed_stages.append(str(stage))
        state.stage_results.append({"action": action, "result": result})
        if result.get("status") in {
            CRMStatus.PENDING_APPROVAL,
            CRMStatus.PENDING_INTEGRATION,
            CRMStatus.BLOCKED,
        }:
            state.status = result["status"]
        elif action == "record_approval_decision" and result.get("status") == "rejected":
            state.status = CRMStatus.REJECTED
        else:
            state.status = CRMStatus.COMPLETED

        if action == "create_customer":
            state.customer_id = result["id"]
        elif action == "create_lead":
            state.lead_id = result["id"]
        elif action == "create_opportunity":
            state.opportunity_id = result["id"]

        return {
            "domain": "crm",
            "action": action,
            "workflow_id": workflow_id,
            "stage": str(stage),
            "workflow_status": str(state.status),
            "result": result,
        }
