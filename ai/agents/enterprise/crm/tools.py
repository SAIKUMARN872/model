from __future__ import annotations

from threading import RLock
from typing import Any
from uuid import uuid4

from .schemas import CRMRecord, CRMStatus, require_amount, require_text


class CRMTools:
    """Thread-safe, process-local CRM operations. No external side effects."""

    def __init__(self) -> None:
        self._lock = RLock()
        self.customers: dict[str, CRMRecord] = {}
        self.leads: dict[str, CRMRecord] = {}
        self.opportunities: dict[str, CRMRecord] = {}
        self.activities: list[dict[str, Any]] = []

    @staticmethod
    def _id(prefix: str) -> str:
        return f"{prefix}_{uuid4().hex[:12]}"

    def create_customer(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = require_text(payload, "name")
        phone = payload.get("phone")
        email = payload.get("email")
        with self._lock:
            if phone:
                for customer in self.customers.values():
                    if customer.data.get("phone") == phone:
                        raise ValueError("A customer with this phone number already exists")
            customer_id = self._id("cust")
            data = {
                "name": name,
                "phone": phone,
                "email": email,
                "city": payload.get("city"),
                "vehicle_interest": payload.get("vehicle_interest"),
                "budget": payload.get("budget"),
                "timeline_days": payload.get("timeline_days"),
            }
            record = CRMRecord(customer_id, "customer", data)
            self.customers[customer_id] = record
            return {"id": customer_id, "type": "customer", "status": record.status, **data}

    def create_lead(self, payload: dict[str, Any]) -> dict[str, Any]:
        customer_id = require_text(payload, "customer_id")
        with self._lock:
            if customer_id not in self.customers:
                raise ValueError("customer_id does not identify an existing customer")
            lead_id = self._id("lead")
            data = {
                "customer_id": customer_id,
                "source": payload.get("source", "unspecified"),
                "vehicle_interest": payload.get(
                    "vehicle_interest",
                    self.customers[customer_id].data.get("vehicle_interest"),
                ),
                "status": "new",
            }
            self.leads[lead_id] = CRMRecord(lead_id, "lead", data)
            return {"id": lead_id, **data}

    def qualify_lead(self, payload: dict[str, Any]) -> dict[str, Any]:
        lead_id = require_text(payload, "lead_id")
        with self._lock:
            lead = self.leads.get(lead_id)
            if not lead:
                raise ValueError("Lead not found")
            qualified = bool(
                lead.data.get("customer_id")
                and lead.data.get("vehicle_interest")
                and self.customers[lead.data["customer_id"]].data.get("budget")
            )
            lead.data["status"] = "qualified" if qualified else "needs_information"
            lead.status = CRMStatus.QUALIFIED if qualified else CRMStatus.BLOCKED
            return {"id": lead_id, "qualified": qualified, "status": lead.data["status"]}

    def create_opportunity(self, payload: dict[str, Any]) -> dict[str, Any]:
        lead_id = require_text(payload, "lead_id")
        with self._lock:
            lead = self.leads.get(lead_id)
            if not lead:
                raise ValueError("Lead not found")
            if lead.data.get("status") != "qualified":
                raise ValueError("Lead must be qualified before creating an opportunity")
            opportunity_id = self._id("opp")
            data = {
                "lead_id": lead_id,
                "customer_id": lead.data["customer_id"],
                "vehicle": payload.get("vehicle", lead.data.get("vehicle_interest")),
                "amount": payload.get("amount"),
                "sales_representative": None,
                "approval_status": "not_requested",
                "booking_status": "not_started",
            }
            self.opportunities[opportunity_id] = CRMRecord(
                opportunity_id, "opportunity", data
            )
            return {"id": opportunity_id, **data}

    def record_activity(self, action: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Record a local CRM activity; does not contact external systems."""
        if action in {"assign_sales_representative", "schedule_follow_up",
                      "arrange_test_drive", "generate_quotation", "negotiation"}:
            required = {
                "assign_sales_representative": "opportunity_id",
                "schedule_follow_up": "opportunity_id",
                "arrange_test_drive": "opportunity_id",
                "generate_quotation": "opportunity_id",
                "negotiation": "opportunity_id",
            }[action]
            reference = require_text(payload, required)
            with self._lock:
                if reference not in self.opportunities:
                    raise ValueError("Opportunity not found")
                if action == "assign_sales_representative":
                    self.opportunities[reference].data["sales_representative"] = (
                        require_text(payload, "sales_representative")
                    )
                if action == "generate_quotation":
                    amount = require_amount(payload, "amount")
                    self.opportunities[reference].data["quoted_amount"] = amount
                item = {
                    "id": self._id("act"),
                    "action": action,
                    "opportunity_id": reference,
                    "details": {k: v for k, v in payload.items() if k != "opportunity_id"},
                    "status": (
                        CRMStatus.DRAFT
                        if action == "generate_quotation"
                        else CRMStatus.SCHEDULED
                        if action in {"schedule_follow_up", "arrange_test_drive"}
                        else CRMStatus.CREATED
                    ),
                }
                self.activities.append(item)
                return item

        if action == "request_approval":
            opportunity_id = require_text(payload, "opportunity_id")
            with self._lock:
                opportunity = self.opportunities.get(opportunity_id)
                if not opportunity:
                    raise ValueError("Opportunity not found")
                opportunity.data["approval_status"] = "pending"
                item = {
                    "id": self._id("approval"),
                    "action": action,
                    "opportunity_id": opportunity_id,
                    "status": CRMStatus.PENDING_APPROVAL,
                    "note": "Awaiting an authorized human or connected approval system.",
                }
                self.activities.append(item)
                return item

        if action == "record_approval_decision":
            opportunity_id = require_text(payload, "opportunity_id")
            decision = require_text(payload, "decision").lower()
            if decision not in {"approved", "rejected"}:
                raise ValueError("decision must be 'approved' or 'rejected'")
            with self._lock:
                opportunity = self.opportunities.get(opportunity_id)
                if not opportunity:
                    raise ValueError("Opportunity not found")
                opportunity.data["approval_status"] = decision
                item = {
                    "id": self._id("approval"),
                    "action": action,
                    "opportunity_id": opportunity_id,
                    "status": decision,
                }
                self.activities.append(item)
                return item

        if action in {"booking", "payment", "invoice", "delivery"}:
            opportunity_id = require_text(payload, "opportunity_id")
            with self._lock:
                opportunity = self.opportunities.get(opportunity_id)
                if not opportunity:
                    raise ValueError("Opportunity not found")
                if opportunity.data.get("approval_status") != "approved":
                    raise ValueError(
                        f"{action} blocked: opportunity approval is not approved"
                    )
                item = {
                    "id": self._id("handoff"),
                    "action": action,
                    "opportunity_id": opportunity_id,
                    "status": CRMStatus.PENDING_INTEGRATION,
                    "note": (
                        "Recorded as an integration handoff only. No real booking, "
                        "payment, invoice, or delivery was performed."
                    ),
                }
                self.activities.append(item)
                return item

        raise ValueError(f"Unsupported CRM action: {action}")

    def list_activities(self) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(item) for item in self.activities]
