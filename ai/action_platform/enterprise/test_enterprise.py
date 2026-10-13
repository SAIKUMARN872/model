"""Tests for ModelNow enterprise action platform."""

import unittest

from ai.action_platform.exceptions import InvalidActionRequestError
from ai.action_platform.enterprise import (
    EnterpriseAction,
    EnterpriseActionExecutor,
    EnterpriseActionStatus,
    EnterpriseActionType,
    validate_enterprise_action,
)


class EnterpriseActionTests(unittest.TestCase):
    def setUp(self):
        self.action = EnterpriseAction(
            action_type=EnterpriseActionType.CRM,
            operation="read_customer",
            payload={"customer_id": "C-101"},
            action_id="act-101",
        )
        self.executor = EnterpriseActionExecutor()
        self.permission = {"enterprise:crm:read_customer"}

    def test_valid_action(self):
        validate_enterprise_action(self.action)

    def test_empty_operation_rejected(self):
        action = EnterpriseAction(
            action_type=EnterpriseActionType.CRM,
            operation=" ",
        )
        with self.assertRaises(InvalidActionRequestError):
            validate_enterprise_action(action)

    def test_invalid_action_type_rejected(self):
        action = EnterpriseAction(
            action_type="crm",
            operation="read_customer",
        )
        with self.assertRaises(InvalidActionRequestError):
            validate_enterprise_action(action)

    def test_permission_required(self):
        result = self.executor.execute(self.action)
        self.assertEqual(result.status, EnterpriseActionStatus.REJECTED)

    def test_approval_required(self):
        self.action.requires_approval = True
        result = self.executor.execute(
            self.action,
            permissions=self.permission,
        )
        self.assertEqual(
            result.status,
            EnterpriseActionStatus.AWAITING_APPROVAL,
        )

    def test_missing_handler_does_not_execute(self):
        result = self.executor.execute(
            self.action,
            permissions=self.permission,
        )
        self.assertEqual(result.status, EnterpriseActionStatus.FAILED)
        self.assertIn("No handler", result.error)

    def test_registered_handler_executes(self):
        self.executor.register_handler(
            EnterpriseActionType.CRM,
            "read_customer",
            lambda action: {"customer_id": action.payload["customer_id"]},
        )
        result = self.executor.execute(
            self.action,
            permissions=self.permission,
        )
        self.assertEqual(result.status, EnterpriseActionStatus.COMPLETED)
        self.assertEqual(result.data["customer_id"], "C-101")

    def test_approved_action_executes(self):
        self.action.requires_approval = True
        self.executor.register_handler(
            EnterpriseActionType.CRM,
            "read_customer",
            lambda action: {"approved": True},
        )
        result = self.executor.execute(
            self.action,
            permissions=self.permission,
            approved_action_ids={"act-101"},
        )
        self.assertEqual(result.status, EnterpriseActionStatus.COMPLETED)

    def test_duplicate_handler_rejected(self):
        handler = lambda action: {"ok": True}
        self.executor.register_handler(
            EnterpriseActionType.CRM,
            "read_customer",
            handler,
        )
        with self.assertRaises(ValueError):
            self.executor.register_handler(
                EnterpriseActionType.CRM,
                "read_customer",
                handler,
            )

    def test_result_serialization(self):
        result = self.executor.execute(self.action)
        serialized = result.to_dict()
        self.assertEqual(serialized["action_type"], "crm")
        self.assertEqual(serialized["status"], "rejected")
        self.assertEqual(serialized["action_id"], "act-101")


if __name__ == "__main__":
    unittest.main()
