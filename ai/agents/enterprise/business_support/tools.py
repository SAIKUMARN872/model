from __future__ import annotations

from threading import RLock
from typing import Any
from uuid import uuid4

from .schemas import (
    SupportTicket,
    TicketPriority,
    TicketStatus,
    require_text,
    validate_priority,
)


class BusinessSupportTools:
    """Local ticket store. Does not send messages or update external systems."""

    def __init__(self) -> None:
        self._lock = RLock()
        self.tickets: dict[str, SupportTicket] = {}

    @staticmethod
    def _id() -> str:
        return f"ticket_{uuid4().hex[:12]}"

    @staticmethod
    def _record(ticket: SupportTicket) -> dict[str, Any]:
        return {
            "ticket_id": ticket.ticket_id,
            "subject": ticket.subject,
            "description": ticket.description,
            "category": ticket.category,
            "priority": ticket.priority,
            "customer_id": ticket.customer_id,
            "assignee": ticket.assignee,
            "status": ticket.status,
            "response_draft": ticket.response_draft,
            "escalation_reason": ticket.escalation_reason,
            "resolution": ticket.resolution,
            "history": [dict(entry) for entry in ticket.history],
        }

    def create_ticket(self, payload: dict[str, Any]) -> dict[str, Any]:
        subject = require_text(payload, "subject")
        description = require_text(payload, "description")
        category = require_text(payload, "category").lower()
        priority = validate_priority(
            payload.get("priority", TicketPriority.MEDIUM.value)
        )
        with self._lock:
            ticket_id = self._id()
            ticket = SupportTicket(
                ticket_id=ticket_id,
                subject=subject,
                description=description,
                category=category,
                priority=priority,
                customer_id=payload.get("customer_id"),
            )
            ticket.history.append({
                "event": "ticket_created",
                "status": TicketStatus.OPEN,
            })
            self.tickets[ticket_id] = ticket
            return self._record(ticket)

    def assign_ticket(self, payload: dict[str, Any]) -> dict[str, Any]:
        ticket_id = require_text(payload, "ticket_id")
        assignee = require_text(payload, "assignee")
        with self._lock:
            ticket = self._get(ticket_id)
            self._ensure_active(ticket)
            ticket.assignee = assignee
            ticket.status = TicketStatus.ASSIGNED
            ticket.history.append({
                "event": "ticket_assigned",
                "assignee": assignee,
                "status": ticket.status,
            })
            return self._record(ticket)

    def update_status(self, payload: dict[str, Any]) -> dict[str, Any]:
        ticket_id = require_text(payload, "ticket_id")
        status = require_text(payload, "status").lower()
        allowed = {item.value for item in TicketStatus}
        if status not in allowed:
            raise ValueError(f"status must be one of: {', '.join(sorted(allowed))}")
        with self._lock:
            ticket = self._get(ticket_id)
            if ticket.status in {TicketStatus.RESOLVED, TicketStatus.CLOSED}:
                raise ValueError("Resolved or closed tickets cannot be updated")
            if status == TicketStatus.CLOSED.value and ticket.status != TicketStatus.RESOLVED:
                raise ValueError("A ticket must be resolved before it can be closed")
            ticket.status = TicketStatus(status)
            ticket.history.append({"event": "status_updated", "status": ticket.status})
            return self._record(ticket)

    def draft_response(self, payload: dict[str, Any]) -> dict[str, Any]:
        ticket_id = require_text(payload, "ticket_id")
        draft = require_text(payload, "draft")
        with self._lock:
            ticket = self._get(ticket_id)
            self._ensure_active(ticket)
            ticket.response_draft = draft
            ticket.history.append({
                "event": "response_drafted",
                "note": "Draft saved locally; not sent to the customer.",
            })
            return self._record(ticket)

    def escalate_ticket(self, payload: dict[str, Any]) -> dict[str, Any]:
        ticket_id = require_text(payload, "ticket_id")
        reason = require_text(payload, "reason")
        priority = validate_priority(
            payload.get("priority", TicketPriority.HIGH.value)
        )
        with self._lock:
            ticket = self._get(ticket_id)
            self._ensure_active(ticket)
            ticket.escalation_reason = reason
            ticket.priority = priority
            ticket.status = TicketStatus.ESCALATED
            ticket.history.append({
                "event": "ticket_escalated",
                "reason": reason,
                "priority": priority,
            })
            return self._record(ticket)

    def resolve_ticket(self, payload: dict[str, Any]) -> dict[str, Any]:
        ticket_id = require_text(payload, "ticket_id")
        resolution = require_text(payload, "resolution")
        with self._lock:
            ticket = self._get(ticket_id)
            if ticket.status in {TicketStatus.RESOLVED, TicketStatus.CLOSED}:
                raise ValueError("Ticket is already resolved or closed")
            ticket.resolution = resolution
            ticket.status = TicketStatus.RESOLVED
            ticket.history.append({
                "event": "ticket_resolved",
                "resolution": resolution,
            })
            return self._record(ticket)

    def get_ticket(self, payload: dict[str, Any]) -> dict[str, Any]:
        ticket_id = require_text(payload, "ticket_id")
        with self._lock:
            return self._record(self._get(ticket_id))

    def list_tickets(self) -> list[dict[str, Any]]:
        with self._lock:
            return [self._record(ticket) for ticket in self.tickets.values()]

    def _get(self, ticket_id: str) -> SupportTicket:
        ticket = self.tickets.get(ticket_id)
        if ticket is None:
            raise ValueError("Ticket not found")
        return ticket

    @staticmethod
    def _ensure_active(ticket: SupportTicket) -> None:
        if ticket.status in {TicketStatus.RESOLVED, TicketStatus.CLOSED}:
            raise ValueError("Resolved or closed tickets cannot be changed")
