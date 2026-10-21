"""Tests for ModelNow Tool Platform health monitoring."""

import unittest

from ai.tool_platform.executor import ExecutionStatus, ToolExecutionResult
from ai.tool_platform.health import (
    HealthStatus,
    ToolHealthChecker,
    ToolHealthMonitor,
)
from ai.tool_platform.registry import ToolRegistry, ToolSpec


class ToolHealthTests(unittest.TestCase):
    def setUp(self):
        self.registry = ToolRegistry()
        self.monitor = ToolHealthMonitor()
        self.checker = ToolHealthChecker(self.registry, self.monitor)

    def register(self, name="health.echo", *, enabled=True, version="1.0.0"):
        return self.registry.register(
            ToolSpec(
                name=name,
                description="Health test tool",
                handler=lambda: "ok",
                version=version,
                enabled=enabled,
            )
        )

    def test_enabled_tool_is_healthy(self):
        self.register()
        result = self.checker.check_tool("health.echo")
        self.assertEqual(result.status, HealthStatus.HEALTHY)
        self.assertTrue(result.handler_available)
        self.assertTrue(result.enabled)

    def test_disabled_tool_is_reported(self):
        self.register(enabled=False)
        result = self.checker.check_tool("health.echo")
        self.assertEqual(result.status, HealthStatus.DISABLED)

    def test_missing_tool_is_reported(self):
        result = self.checker.check_tool("missing.tool")
        self.assertEqual(result.status, HealthStatus.NOT_FOUND)

    def test_invalid_name_is_reported_as_unknown(self):
        result = self.checker.check_tool(" ")
        self.assertEqual(result.status, HealthStatus.UNKNOWN)

    def test_check_all_counts_tools(self):
        self.register("health.enabled")
        self.register("health.disabled", enabled=False)
        report = self.checker.check_all()
        self.assertEqual(report.total_tools, 2)
        self.assertEqual(report.healthy_tools, 1)
        self.assertEqual(report.disabled_tools, 1)
        self.assertEqual(report.status, HealthStatus.UNKNOWN)

    def test_check_all_can_exclude_disabled_tools(self):
        self.register("health.enabled")
        self.register("health.disabled", enabled=False)
        report = self.checker.check_all(include_disabled=False)
        self.assertEqual(report.total_tools, 1)
        self.assertEqual(report.status, HealthStatus.HEALTHY)

    def test_empty_registry_is_unknown(self):
        report = self.checker.check_all()
        self.assertEqual(report.status, HealthStatus.UNKNOWN)
        self.assertEqual(report.total_tools, 0)

    def test_monitor_records_success(self):
        self.register()
        self.monitor.record_result(
            ToolExecutionResult(
                tool_name="health.echo",
                success=True,
                status=ExecutionStatus.SUCCESS,
                output="ok",
                version="1.0.0",
            )
        )
        result = self.checker.check_tool("health.echo")
        self.assertEqual(result.execution_count, 1)
        self.assertEqual(result.success_count, 1)
        self.assertEqual(result.failure_count, 0)
        self.assertEqual(result.last_execution_status, "success")

    def test_monitor_records_failure(self):
        self.register()
        self.monitor.record_result(
            ToolExecutionResult(
                tool_name="health.echo",
                success=False,
                status=ExecutionStatus.ERROR,
                error="test failure",
                version="1.0.0",
            )
        )
        metrics = self.monitor.get_metrics("health.echo", "1.0.0")
        self.assertEqual(metrics["failure_count"], 1)
        self.assertEqual(metrics["last_error"], "test failure")

    def test_monitor_returns_defensive_copies(self):
        self.monitor.record_result(
            ToolExecutionResult(
                tool_name="health.echo",
                success=True,
                status=ExecutionStatus.SUCCESS,
                version="1.0.0",
            )
        )
        metrics = self.monitor.get_metrics("health.echo", "1.0.0")
        metrics["success_count"] = 999
        self.assertEqual(
            self.monitor.get_metrics(
                "health.echo", "1.0.0"
            )["success_count"],
            1,
        )

    def test_report_serializes(self):
        self.register()
        data = self.checker.check_all().to_dict()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["tools"][0]["name"], "health.echo")

    def test_rejects_invalid_monitor_result(self):
        with self.assertRaises(TypeError):
            self.monitor.record_result("not a result")

    def test_rejects_invalid_checker_registry(self):
        with self.assertRaises(TypeError):
            ToolHealthChecker(object())


if __name__ == "__main__":
    unittest.main()
