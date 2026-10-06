from decimal import Decimal
import unittest

from .alerts import SpendAlertStore
from .evaluator import SpendAlertEvaluator
from .manager import SpendAlertManager
from .models import (
    AlertSeverity,
    AlertStatus,
    SpendAlertRule,
)
from .utils import (
    build_alert_message,
    calculate_threshold_utilization,
    is_threshold_exceeded,
    to_decimal,
    validate_severity,
    validate_threshold,
)


class SpendAlertTest(unittest.TestCase):

    def setUp(self) -> None:
        self.store = SpendAlertStore()
        self.evaluator = SpendAlertEvaluator(self.store)
        self.manager = SpendAlertManager()

    def test_rule_creation(self) -> None:
        rule = SpendAlertRule(
            rule_id="rule-001",
            name="Monthly warning",
            threshold=Decimal("100"),
            severity=AlertSeverity.WARNING,
        )

        self.store.add_rule(rule)

        self.assertEqual(self.store.rule_count(), 1)
        self.assertEqual(
            self.store.get_rule("rule-001"),
            rule,
        )

    def test_alert_trigger(self) -> None:
        self.store.add_rule(
            SpendAlertRule(
                rule_id="rule-001",
                name="Spend warning",
                threshold=Decimal("100"),
                severity=AlertSeverity.WARNING,
            )
        )

        alerts = self.evaluator.evaluate(
            Decimal("125"),
            model="test-llm",
            provider="test-provider",
            entity_id="project-001",
        )

        self.assertEqual(len(alerts), 1)

        alert = alerts[0]

        self.assertEqual(alert.rule_id, "rule-001")
        self.assertEqual(alert.current_spend, Decimal("125"))
        self.assertEqual(alert.threshold, Decimal("100"))
        self.assertEqual(alert.severity, AlertSeverity.WARNING)
        self.assertEqual(alert.status, AlertStatus.ACTIVE)

    def test_threshold_not_reached(self) -> None:
        self.store.add_rule(
            SpendAlertRule(
                rule_id="rule-001",
                name="Spend warning",
                threshold=Decimal("100"),
            )
        )

        alerts = self.evaluator.evaluate(Decimal("50"))

        self.assertEqual(len(alerts), 0)
        self.assertEqual(self.store.alert_count(), 0)

    def test_disabled_rule(self) -> None:
        self.store.add_rule(
            SpendAlertRule(
                rule_id="rule-001",
                name="Disabled warning",
                threshold=Decimal("100"),
                enabled=False,
            )
        )

        alerts = self.evaluator.evaluate(Decimal("150"))

        self.assertEqual(len(alerts), 0)

    def test_alert_acknowledgement(self) -> None:
        self.store.add_rule(
            SpendAlertRule(
                rule_id="rule-001",
                name="Warning",
                threshold=Decimal("100"),
            )
        )

        alerts = self.evaluator.evaluate(Decimal("150"))
        alert_id = alerts[0].alert_id

        updated = self.store.acknowledge(alert_id)

        self.assertEqual(
            updated.status,
            AlertStatus.ACKNOWLEDGED,
        )

    def test_alert_resolution(self) -> None:
        self.store.add_rule(
            SpendAlertRule(
                rule_id="rule-001",
                name="Warning",
                threshold=Decimal("100"),
            )
        )

        alerts = self.evaluator.evaluate(Decimal("150"))
        alert_id = alerts[0].alert_id

        updated = self.store.resolve(alert_id)

        self.assertEqual(
            updated.status,
            AlertStatus.RESOLVED,
        )

    def test_manager(self) -> None:
        self.manager.create_rule(
            rule_id="rule-001",
            name="Critical spend",
            threshold=Decimal("500"),
            severity=AlertSeverity.CRITICAL,
        )

        alerts = self.manager.evaluate(
            Decimal("750"),
            model="test-llm",
            provider="test-provider",
        )

        self.assertEqual(len(alerts), 1)
        self.assertEqual(
            alerts[0].severity,
            AlertSeverity.CRITICAL,
        )

        summary = self.manager.summarize(
            total_spend=Decimal("750"),
        )

        self.assertEqual(summary.total_rules, 1)
        self.assertEqual(summary.enabled_rules, 1)
        self.assertEqual(summary.total_alerts, 1)
        self.assertEqual(summary.active_alerts, 1)
        self.assertEqual(summary.critical_alerts, 1)
        self.assertEqual(summary.total_spend, Decimal("750"))

    def test_utils(self) -> None:
        self.assertEqual(
            to_decimal("12.50"),
            Decimal("12.50"),
        )

        self.assertEqual(
            validate_threshold("100"),
            Decimal("100"),
        )

        self.assertTrue(
            is_threshold_exceeded(
                Decimal("100"),
                Decimal("100"),
            )
        )

        self.assertFalse(
            is_threshold_exceeded(
                Decimal("99"),
                Decimal("100"),
            )
        )

        self.assertEqual(
            calculate_threshold_utilization(
                Decimal("125"),
                Decimal("100"),
            ),
            Decimal("125"),
        )

        self.assertEqual(
            validate_severity("critical"),
            AlertSeverity.CRITICAL,
        )

        message = build_alert_message(
            "Monthly spend",
            Decimal("125"),
            Decimal("100"),
        )

        self.assertIn("Monthly spend", message)
        self.assertIn("125", message)
        self.assertIn("100", message)

    def test_invalid_threshold(self) -> None:
        with self.assertRaises(ValueError):
            validate_threshold(Decimal("-1"))

    def test_invalid_spend(self) -> None:
        self.store.add_rule(
            SpendAlertRule(
                rule_id="rule-001",
                name="Warning",
                threshold=Decimal("100"),
            )
        )

        with self.assertRaises(ValueError):
            self.evaluator.evaluate(Decimal("-10"))


if __name__ == "__main__":
    unittest.main()
