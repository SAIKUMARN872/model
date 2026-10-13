import json
import logging
import unittest
from io import StringIO

from ai.agent_platform.constants import AgentState
from ai.agent_platform.monitoring import (
    AgentHealthChecker,
    AgentPlatformMetrics,
    StructuredLogger,
    TelemetryRecorder,
)


class FakeManager:
    def __init__(self, state=AgentState.READY):
        self.state = state

    def get_state(self, agent_id):
        if agent_id == "missing":
            raise KeyError("Agent not found")
        return self.state


class MonitoringTests(unittest.TestCase):
    def test_ready_agent_is_healthy(self):
        result = AgentHealthChecker(FakeManager()).check_agent("agent-a")
        self.assertTrue(result.healthy)
        self.assertEqual(result.state, AgentState.READY.value)
        self.assertTrue(result.checked_at)

    def test_running_agent_is_healthy(self):
        result = AgentHealthChecker(
            FakeManager(AgentState.RUNNING)
        ).check_agent("agent-a")
        self.assertTrue(result.healthy)

    def test_failed_agent_is_unhealthy(self):
        result = AgentHealthChecker(
            FakeManager(AgentState.FAILED)
        ).check_agent("agent-a")
        self.assertFalse(result.healthy)
        self.assertIn("failed", result.details.lower())

    def test_missing_agent_returns_unknown_health(self):
        result = AgentHealthChecker(FakeManager()).check_agent("missing")
        self.assertFalse(result.healthy)
        self.assertEqual(result.state, "UNKNOWN")

    def test_structured_logger_emits_json(self):
        stream = StringIO()
        logger = logging.getLogger("monitoring-test-json")
        logger.handlers.clear()
        logger.propagate = False
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(stream)
        logger.addHandler(handler)
        try:
            record = StructuredLogger(logger=logger).info(
                "agent.started", agent_id="agent-a"
            )
            emitted = json.loads(stream.getvalue())
            self.assertEqual(emitted["event"], "agent.started")
            self.assertEqual(emitted["agent_id"], "agent-a")
            self.assertEqual(record["event"], "agent.started")
            self.assertIn("timestamp", emitted)
        finally:
            logger.removeHandler(handler)
            handler.close()

    def test_logger_rejects_unknown_level(self):
        with self.assertRaises(ValueError):
            StructuredLogger().log_event("NOT_A_LEVEL", "test")

    def test_metrics_increment_counter(self):
        metrics = AgentPlatformMetrics()
        self.assertEqual(metrics.increment("agent.success"), 1)
        self.assertEqual(metrics.increment("agent.success", 2), 3)
        self.assertEqual(
            metrics.snapshot()["counters"]["agent.success"], 3
        )

    def test_metrics_observation_summary(self):
        metrics = AgentPlatformMetrics()
        metrics.observe("execution.seconds", 0.2)
        result = metrics.observe("execution.seconds", 0.8)
        self.assertEqual(result["count"], 2)
        self.assertAlmostEqual(result["total"], 1.0)
        self.assertEqual(result["min"], 0.2)
        self.assertEqual(result["max"], 0.8)

    def test_metrics_reject_non_numeric_values(self):
        metrics = AgentPlatformMetrics()
        with self.assertRaises(TypeError):
            metrics.increment("bad", "one")
        with self.assertRaises(TypeError):
            metrics.observe("bad", True)

    def test_metrics_reset(self):
        metrics = AgentPlatformMetrics()
        metrics.increment("requests")
        metrics.observe("latency", 1.0)
        metrics.reset()
        self.assertEqual(
            metrics.snapshot(), {"counters": {}, "observations": {}}
        )

    def test_telemetry_records_and_filters_events(self):
        recorder = TelemetryRecorder()
        first = recorder.record("agent.started", agent_id="agent-a")
        recorder.record("agent.failed", agent_id="agent-b")
        self.assertEqual(len(recorder.get_events()), 2)
        self.assertEqual(
            len(recorder.get_events("agent.started")), 1
        )
        self.assertEqual(first.attributes["agent_id"], "agent-a")
        self.assertTrue(first.timestamp)

    def test_telemetry_retains_most_recent_events(self):
        recorder = TelemetryRecorder(max_events=2)
        recorder.record("first")
        recorder.record("second")
        recorder.record("third")
        events = recorder.get_events()
        self.assertEqual(len(events), 2)
        self.assertEqual(
            [event.name for event in events], ["second", "third"]
        )

    def test_telemetry_validates_retention_limit(self):
        with self.assertRaises(ValueError):
            TelemetryRecorder(max_events=0)
        with self.assertRaises(TypeError):
            TelemetryRecorder(max_events=1.5)

    def test_telemetry_clear(self):
        recorder = TelemetryRecorder()
        recorder.record("agent.started")
        recorder.clear()
        self.assertEqual(recorder.get_events(), ())


if __name__ == "__main__":
    unittest.main()


