"""Unit tests for browser automation monitoring."""

import json
import logging
import math
import unittest
from io import StringIO

from ai.browser_automation.monitoring import (
    BrowserAutomationLogger,
    BrowserAutomationMetrics,
    TraceManager,
)


class MonitoringTests(unittest.TestCase):
    def test_structured_log_is_valid_json(self):
        stream = StringIO()
        logger = logging.Logger("monitoring-test-json")
        logger.setLevel(logging.INFO)
        logger.addHandler(logging.StreamHandler(stream))
        result = BrowserAutomationLogger(logger=logger).info(
            "task.started", task_id="task-1", trace_id="trace-1"
        )
        logged = json.loads(stream.getvalue())
        self.assertEqual(logged["event"], "task.started")
        self.assertEqual(logged["task_id"], "task-1")
        self.assertEqual(result["trace_id"], "trace-1")

    def test_redacts_sensitive_fields(self):
        logger = logging.Logger("monitoring-test-redaction")
        logger.addHandler(logging.NullHandler())
        record = BrowserAutomationLogger(logger=logger).info(
            "request.sent",
            fields={
                "password": "do-not-log",
                "nested": {"api_key": "secret-value"},
                "safe": "visible",
            },
        )
        serialized = json.dumps(record)
        self.assertNotIn("do-not-log", serialized)
        self.assertNotIn("secret-value", serialized)
        self.assertEqual(record["fields"]["safe"], "visible")

    def test_log_rejects_empty_event(self):
        logger = logging.Logger("monitoring-test-empty")
        with self.assertRaises(ValueError):
            BrowserAutomationLogger(logger=logger).info(" ")

    def test_metrics_count_and_snapshot(self):
        metrics = BrowserAutomationMetrics()
        self.assertEqual(metrics.increment("tasks.started"), 1)
        metrics.increment("tasks.started", 2)
        metrics.observe_duration("tasks.execute", 1.0)
        metrics.observe_duration("tasks.execute", 3.0)
        snapshot = metrics.snapshot()
        self.assertEqual(snapshot["counters"]["tasks.started"], 3)
        self.assertEqual(snapshot["durations"]["tasks.execute"]["count"], 2)
        self.assertEqual(
            snapshot["durations"]["tasks.execute"]["average_seconds"], 2.0
        )
        self.assertEqual(snapshot["durations"]["tasks.execute"]["max_seconds"], 3.0)

    def test_metrics_reject_invalid_duration(self):
        metrics = BrowserAutomationMetrics()
        for value in (-1, math.inf, math.nan):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    metrics.observe_duration("task", value)

    def test_metrics_reset(self):
        metrics = BrowserAutomationMetrics()
        metrics.increment("tasks.started")
        metrics.reset()
        self.assertEqual(metrics.snapshot(), {"counters": {}, "durations": {}})

    def test_trace_child_shares_trace_id(self):
        manager = TraceManager()
        root = manager.start_trace()
        child = manager.start_span("browser.navigate", root, attributes={"step": 1})
        self.assertEqual(root.trace_id, child.trace_id)
        self.assertEqual(child.parent_span_id, root.span_id)
        child.finish()
        self.assertTrue(child.finished)
        self.assertGreaterEqual(child.duration_seconds, 0)

    def test_trace_records_error(self):
        span = TraceManager().start_trace()
        span.finish(error="navigation failed")
        self.assertEqual(span.error, "navigation failed")
        self.assertTrue(span.to_dict()["finished"])

    def test_trace_rejects_invalid_parent(self):
        with self.assertRaises(TypeError):
            TraceManager().start_span("child", object())


if __name__ == "__main__":
    unittest.main()
