from __future__ import annotations

import unittest
from datetime import datetime, timezone

from ..models import ModelRecord
from .heartbeat import Heartbeat
from .health import HealthManager
from .status import HealthCheckResult, HealthStatus
from .utils import (
    availability_ratio,
    average_latency,
    is_available,
    is_healthy,
    status_from_failures,
)


def make_model(
    provider: str = "openai",
    model_id: str = "test-model",
) -> ModelRecord:
    return ModelRecord(
        provider=provider,
        model_id=model_id,
        display_name="Test Model",
    )


class TestHealthStatus(unittest.TestCase):

    def test_status_values(self):
        self.assertEqual(
            HealthStatus.UNKNOWN.value,
            "unknown",
        )
        self.assertEqual(
            HealthStatus.HEALTHY.value,
            "healthy",
        )
        self.assertEqual(
            HealthStatus.DEGRADED.value,
            "degraded",
        )
        self.assertEqual(
            HealthStatus.UNHEALTHY.value,
            "unhealthy",
        )
        self.assertEqual(
            HealthStatus.DISABLED.value,
            "disabled",
        )

    def test_health_check_result(self):
        result = HealthCheckResult(
            HealthStatus.HEALTHY,
            message="ok",
            latency_ms=25.5,
        )

        self.assertEqual(
            result.status,
            HealthStatus.HEALTHY,
        )
        self.assertEqual(result.message, "ok")
        self.assertEqual(result.latency_ms, 25.5)
        self.assertTrue(result.healthy)
        self.assertTrue(result.available)

    def test_degraded_available(self):
        result = HealthCheckResult(
            HealthStatus.DEGRADED
        )

        self.assertFalse(result.healthy)
        self.assertTrue(result.available)

    def test_unhealthy_not_available(self):
        result = HealthCheckResult(
            HealthStatus.UNHEALTHY
        )

        self.assertFalse(result.healthy)
        self.assertFalse(result.available)

    def test_invalid_status(self):
        with self.assertRaises(TypeError):
            HealthCheckResult("healthy")

    def test_negative_latency(self):
        with self.assertRaises(ValueError):
            HealthCheckResult(
                HealthStatus.HEALTHY,
                latency_ms=-1,
            )


class TestHeartbeat(unittest.TestCase):

    def test_initial_state(self):
        heartbeat = Heartbeat("openai:test-model")

        self.assertEqual(
            heartbeat.name,
            "openai:test-model",
        )
        self.assertIsNone(heartbeat.last_seen)
        self.assertEqual(
            heartbeat.consecutive_failures,
            0,
        )
        self.assertFalse(heartbeat.alive)
        self.assertIsNone(
            heartbeat.age_seconds()
        )

    def test_mark_alive(self):
        heartbeat = Heartbeat("openai:test-model")
        when = datetime(
            2026,
            1,
            1,
            tzinfo=timezone.utc,
        )

        heartbeat.mark_alive(when)

        self.assertEqual(
            heartbeat.last_seen,
            when,
        )
        self.assertTrue(heartbeat.alive)
        self.assertEqual(
            heartbeat.consecutive_failures,
            0,
        )

    def test_mark_alive_resets_failures(self):
        heartbeat = Heartbeat("openai:test-model")

        heartbeat.mark_failure()
        heartbeat.mark_failure()

        self.assertEqual(
            heartbeat.consecutive_failures,
            2,
        )

        heartbeat.mark_alive()

        self.assertEqual(
            heartbeat.consecutive_failures,
            0,
        )

    def test_mark_failure(self):
        heartbeat = Heartbeat("openai:test-model")

        heartbeat.mark_failure()
        heartbeat.mark_failure()

        self.assertEqual(
            heartbeat.consecutive_failures,
            2,
        )

    def test_negative_failures(self):
        with self.assertRaises(ValueError):
            Heartbeat(
                "openai:test-model",
                consecutive_failures=-1,
            )

    def test_empty_name(self):
        with self.assertRaises(ValueError):
            Heartbeat("")

    def test_age_seconds(self):
        heartbeat = Heartbeat("openai:test-model")

        seen = datetime(
            2026,
            1,
            1,
            tzinfo=timezone.utc,
        )

        now = datetime(
            2026,
            1,
            1,
            0,
            0,
            10,
            tzinfo=timezone.utc,
        )

        heartbeat.mark_alive(seen)

        self.assertEqual(
            heartbeat.age_seconds(now),
            10.0,
        )


class TestHealthUtils(unittest.TestCase):

    def test_is_healthy(self):
        self.assertTrue(
            is_healthy(HealthStatus.HEALTHY)
        )
        self.assertFalse(
            is_healthy(HealthStatus.DEGRADED)
        )

    def test_is_available(self):
        self.assertTrue(
            is_available(HealthStatus.HEALTHY)
        )
        self.assertTrue(
            is_available(HealthStatus.DEGRADED)
        )
        self.assertFalse(
            is_available(HealthStatus.UNHEALTHY)
        )

    def test_status_from_failures(self):
        self.assertEqual(
            status_from_failures(0),
            HealthStatus.HEALTHY,
        )
        self.assertEqual(
            status_from_failures(1),
            HealthStatus.DEGRADED,
        )
        self.assertEqual(
            status_from_failures(2),
            HealthStatus.DEGRADED,
        )
        self.assertEqual(
            status_from_failures(3),
            HealthStatus.UNHEALTHY,
        )

    def test_custom_failure_thresholds(self):
        self.assertEqual(
            status_from_failures(
                2,
                degraded_threshold=2,
                unhealthy_threshold=5,
            ),
            HealthStatus.DEGRADED,
        )

        self.assertEqual(
            status_from_failures(
                5,
                degraded_threshold=2,
                unhealthy_threshold=5,
            ),
            HealthStatus.UNHEALTHY,
        )

    def test_negative_failures(self):
        with self.assertRaises(ValueError):
            status_from_failures(-1)

    def test_invalid_thresholds(self):
        with self.assertRaises(ValueError):
            status_from_failures(
                1,
                degraded_threshold=0,
            )

        with self.assertRaises(ValueError):
            status_from_failures(
                1,
                degraded_threshold=3,
                unhealthy_threshold=3,
            )

    def test_average_latency(self):
        self.assertEqual(
            average_latency([10.0, 20.0, 30.0]),
            20.0,
        )

    def test_average_latency_empty(self):
        self.assertIsNone(
            average_latency([])
        )

    def test_average_latency_negative(self):
        with self.assertRaises(ValueError):
            average_latency([10.0, -1.0])

    def test_availability_ratio(self):
        self.assertEqual(
            availability_ratio(
                [
                    HealthStatus.HEALTHY,
                    HealthStatus.DEGRADED,
                    HealthStatus.UNHEALTHY,
                    HealthStatus.UNKNOWN,
                ]
            ),
            0.5,
        )

    def test_availability_ratio_empty(self):
        self.assertEqual(
            availability_ratio([]),
            0.0,
        )


class TestHealthManager(unittest.TestCase):

    def setUp(self):
        self.manager = HealthManager()
        self.model = make_model()

    def test_register(self):
        health = self.manager.register(
            self.model
        )

        self.assertEqual(
            health.qualified_id,
            "openai:test-model",
        )
        self.assertEqual(
            health.status,
            HealthStatus.UNKNOWN,
        )
        self.assertEqual(
            self.manager.count(),
            1,
        )

    def test_register_duplicate(self):
        self.manager.register(self.model)

        with self.assertRaises(ValueError):
            self.manager.register(self.model)

    def test_register_invalid_model(self):
        with self.assertRaises(TypeError):
            self.manager.register("invalid")

    def test_get(self):
        self.manager.register(self.model)

        health = self.manager.get(
            "OPENAI:TEST-MODEL"
        )

        self.assertIsNotNone(health)
        self.assertEqual(
            health.qualified_id,
            "openai:test-model",
        )

    def test_get_unknown(self):
        self.assertIsNone(
            self.manager.get(
                "openai:missing"
            )
        )

    def test_upsert(self):
        first = self.manager.upsert(
            self.model
        )

        second = self.manager.upsert(
            self.model
        )

        self.assertIs(first, second)
        self.assertEqual(
            self.manager.count(),
            1,
        )

    def test_record_success(self):
        self.manager.register(self.model)

        checked_at = datetime(
            2026,
            1,
            1,
            tzinfo=timezone.utc,
        )

        health = self.manager.record_success(
            "openai:test-model",
            latency_ms=42.5,
            message="healthy",
            checked_at=checked_at,
        )

        self.assertEqual(
            health.status,
            HealthStatus.HEALTHY,
        )
        self.assertEqual(
            health.latency_ms,
            42.5,
        )
        self.assertEqual(
            health.message,
            "healthy",
        )
        self.assertEqual(
            health.last_checked,
            checked_at,
        )
        self.assertEqual(
            health.consecutive_failures,
            0,
        )

    def test_record_failure_degraded(self):
        self.manager.register(self.model)

        health = self.manager.record_failure(
            "openai:test-model",
            message="temporary failure",
        )

        self.assertEqual(
            health.status,
            HealthStatus.DEGRADED,
        )
        self.assertEqual(
            health.consecutive_failures,
            1,
        )

    def test_record_failure_unhealthy(self):
        self.manager.register(self.model)

        self.manager.record_failure(
            "openai:test-model"
        )
        self.manager.record_failure(
            "openai:test-model"
        )
        health = self.manager.record_failure(
            "openai:test-model"
        )

        self.assertEqual(
            health.status,
            HealthStatus.UNHEALTHY,
        )
        self.assertEqual(
            health.consecutive_failures,
            3,
        )

    def test_success_recovers_model(self):
        self.manager.register(self.model)

        self.manager.record_failure(
            "openai:test-model"
        )
        self.manager.record_failure(
            "openai:test-model"
        )

        health = self.manager.record_success(
            "openai:test-model"
        )

        self.assertEqual(
            health.status,
            HealthStatus.HEALTHY,
        )
        self.assertEqual(
            health.consecutive_failures,
            0,
        )

    def test_check(self):
        self.manager.register(self.model)

        self.manager.record_success(
            "openai:test-model",
            latency_ms=15.0,
            message="ok",
        )

        result = self.manager.check(
            "openai:test-model"
        )

        self.assertEqual(
            result.status,
            HealthStatus.HEALTHY,
        )
        self.assertTrue(result.healthy)
        self.assertTrue(result.available)
        self.assertEqual(
            result.latency_ms,
            15.0,
        )

    def test_unknown_model_operations(self):
        with self.assertRaises(KeyError):
            self.manager.record_success(
                "openai:missing"
            )

        with self.assertRaises(KeyError):
            self.manager.record_failure(
                "openai:missing"
            )

        with self.assertRaises(KeyError):
            self.manager.check(
                "openai:missing"
            )

    def test_negative_latency(self):
        self.manager.register(self.model)

        with self.assertRaises(ValueError):
            self.manager.record_success(
                "openai:test-model",
                latency_ms=-1,
            )

        with self.assertRaises(ValueError):
            self.manager.record_failure(
                "openai:test-model",
                latency_ms=-1,
            )

    def test_list_all(self):
        self.manager.register(
            make_model(
                "openai",
                "model-a",
            )
        )
        self.manager.register(
            make_model(
                "anthropic",
                "model-b",
            )
        )

        self.assertEqual(
            len(self.manager.list_all()),
            2,
        )

    def test_healthy_models(self):
        self.manager.register(
            make_model(
                "openai",
                "model-a",
            )
        )
        self.manager.register(
            make_model(
                "anthropic",
                "model-b",
            )
        )

        self.manager.record_success(
            "openai:model-a"
        )

        self.manager.record_failure(
            "anthropic:model-b"
        )

        healthy = self.manager.healthy_models()

        self.assertEqual(
            len(healthy),
            1,
        )
        self.assertEqual(
            healthy[0].qualified_id,
            "openai:model-a",
        )

    def test_available_models(self):
        self.manager.register(
            make_model(
                "openai",
                "model-a",
            )
        )
        self.manager.register(
            make_model(
                "anthropic",
                "model-b",
            )
        )
        self.manager.register(
            make_model(
                "google",
                "model-c",
            )
        )

        self.manager.record_success(
            "openai:model-a"
        )
        self.manager.record_failure(
            "anthropic:model-b"
        )
        self.manager.record_failure(
            "google:model-c"
        )
        self.manager.record_failure(
            "google:model-c"
        )
        self.manager.record_failure(
            "google:model-c"
        )

        available = self.manager.available_models()

        self.assertEqual(
            len(available),
            2,
        )

    def test_average_latency(self):
        self.manager.register(
            make_model(
                "openai",
                "model-a",
            )
        )
        self.manager.register(
            make_model(
                "openai",
                "model-b",
            )
        )

        self.manager.record_success(
            "openai:model-a",
            latency_ms=10.0,
        )
        self.manager.record_success(
            "openai:model-b",
            latency_ms=30.0,
        )

        self.assertEqual(
            self.manager.average_latency(),
            20.0,
        )

    def test_clear(self):
        self.manager.register(self.model)

        self.assertEqual(
            self.manager.count(),
            1,
        )

        self.manager.clear()

        self.assertEqual(
            self.manager.count(),
            0,
        )
        self.assertIsNone(
            self.manager.get(
                "openai:test-model"
            )
        )


if __name__ == "__main__":
    unittest.main()
