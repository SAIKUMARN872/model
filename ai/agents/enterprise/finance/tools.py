from __future__ import annotations

from threading import RLock
from typing import Any
from uuid import uuid4

from .schemas import (
    FinanceStatus,
    InvoiceStatus,
    require_amount,
    require_text,
)


class FinanceTools:
    """In-memory financial records. No payment or bank API is called."""

    def __init__(self) -> None:
        self._lock = RLock()
        self.budgets: dict[str, dict[str, Any]] = {}
        self.expenses: dict[str, dict[str, Any]] = {}
        self.invoices: dict[str, dict[str, Any]] = {}
        self.transactions: list[dict[str, Any]] = []

    @staticmethod
    def _new_id(prefix: str) -> str:
        return f"{prefix}_{uuid4().hex[:12]}"

    def create_budget(self, payload: dict[str, Any]) -> dict[str, Any]:
        name = require_text(payload, "name")
        amount = require_amount(payload, "amount")
        department = require_text(payload, "department")
        with self._lock:
            budget_id = self._new_id("budget")
            budget = {
                "budget_id": budget_id,
                "name": name,
                "department": department,
                "limit": amount,
                "committed": 0.0,
                "status": "active",
            }
            self.budgets[budget_id] = budget
            return dict(budget)

    def submit_expense(self, payload: dict[str, Any]) -> dict[str, Any]:
        employee_id = require_text(payload, "employee_id")
        description = require_text(payload, "description")
        amount = require_amount(payload)
        budget_id = payload.get("budget_id")
        with self._lock:
            budget = None
            if budget_id is not None:
                budget = self.budgets.get(budget_id)
                if budget is None:
                    raise ValueError("Budget not found")
                if budget["committed"] + amount > budget["limit"]:
                    raise ValueError("Expense exceeds remaining budget")
            expense_id = self._new_id("expense")
            expense = {
                "expense_id": expense_id,
                "employee_id": employee_id,
                "description": description,
                "amount": amount,
                "budget_id": budget_id,
                "status": FinanceStatus.PENDING_APPROVAL,
                "approval_note": None,
            }
            self.expenses[expense_id] = expense
            if budget is not None:
                budget["committed"] = round(budget["committed"] + amount, 2)
            return dict(expense)

    def decide_expense(self, payload: dict[str, Any]) -> dict[str, Any]:
        expense_id = require_text(payload, "expense_id")
        decision = require_text(payload, "decision").lower()
        if decision not in {"approve", "reject"}:
            raise ValueError("decision must be 'approve' or 'reject'")
        note = payload.get("note", "")
        with self._lock:
            expense = self.expenses.get(expense_id)
            if expense is None:
                raise ValueError("Expense not found")
            if expense["status"] != FinanceStatus.PENDING_APPROVAL:
                raise ValueError("Expense is not awaiting approval")
            expense["status"] = (
                FinanceStatus.APPROVED
                if decision == "approve"
                else FinanceStatus.REJECTED
            )
            expense["approval_note"] = note
            if decision == "reject" and expense["budget_id"]:
                budget = self.budgets[expense["budget_id"]]
                budget["committed"] = round(
                    budget["committed"] - expense["amount"], 2
                )
            return dict(expense)

    def create_invoice(self, payload: dict[str, Any]) -> dict[str, Any]:
        supplier = require_text(payload, "supplier")
        invoice_number = require_text(payload, "invoice_number")
        amount = require_amount(payload)
        with self._lock:
            if any(
                invoice["invoice_number"] == invoice_number
                for invoice in self.invoices.values()
            ):
                raise ValueError("Invoice number already exists")
            invoice_id = self._new_id("invoice")
            invoice = {
                "invoice_id": invoice_id,
                "invoice_number": invoice_number,
                "supplier": supplier,
                "amount": amount,
                "paid_amount": 0.0,
                "status": InvoiceStatus.OPEN,
                "approval_note": None,
            }
            self.invoices[invoice_id] = invoice
            return dict(invoice)

    def decide_invoice(self, payload: dict[str, Any]) -> dict[str, Any]:
        invoice_id = require_text(payload, "invoice_id")
        decision = require_text(payload, "decision").lower()
        if decision not in {"approve", "reject"}:
            raise ValueError("decision must be 'approve' or 'reject'")
        with self._lock:
            invoice = self.invoices.get(invoice_id)
            if invoice is None:
                raise ValueError("Invoice not found")
            if invoice["status"] != InvoiceStatus.OPEN:
                raise ValueError("Invoice is not awaiting approval")
            invoice["status"] = (
                InvoiceStatus.APPROVED
                if decision == "approve"
                else InvoiceStatus.REJECTED
            )
            invoice["approval_note"] = payload.get("note", "")
            return dict(invoice)

    def record_payment(self, payload: dict[str, Any]) -> dict[str, Any]:
        invoice_id = require_text(payload, "invoice_id")
        amount = require_amount(payload)
        reference = require_text(payload, "reference")
        with self._lock:
            invoice = self.invoices.get(invoice_id)
            if invoice is None:
                raise ValueError("Invoice not found")
            if invoice["status"] not in {
                InvoiceStatus.APPROVED,
                InvoiceStatus.PARTIALLY_PAID,
            }:
                raise ValueError("Only approved invoices can have payments recorded")
            if invoice["paid_amount"] + amount > invoice["amount"]:
                raise ValueError("Payment exceeds outstanding invoice amount")
            transaction = {
                "transaction_id": self._new_id("txn"),
                "invoice_id": invoice_id,
                "amount": amount,
                "reference": reference,
                "recorded_only": True,
            }
            invoice["paid_amount"] = round(invoice["paid_amount"] + amount, 2)
            invoice["status"] = (
                InvoiceStatus.PAID
                if invoice["paid_amount"] == invoice["amount"]
                else InvoiceStatus.PARTIALLY_PAID
            )
            self.transactions.append(transaction)
            return dict(transaction)

    def get_budget(self, payload: dict[str, Any]) -> dict[str, Any]:
        budget_id = require_text(payload, "budget_id")
        with self._lock:
            budget = self.budgets.get(budget_id)
            if budget is None:
                raise ValueError("Budget not found")
            result = dict(budget)
            result["remaining"] = round(
                result["limit"] - result["committed"], 2
            )
            return result

    def get_invoice(self, payload: dict[str, Any]) -> dict[str, Any]:
        invoice_id = require_text(payload, "invoice_id")
        with self._lock:
            invoice = self.invoices.get(invoice_id)
            if invoice is None:
                raise ValueError("Invoice not found")
            return dict(invoice)

    def list_transactions(self) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(transaction) for transaction in self.transactions]
