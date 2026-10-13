from __future__ import annotations

from datetime import datetime, timedelta, timezone

from ai.model_registry.health.health import HealthManager
from ai.model_registry.health.heartbeat import Heartbeat
from ai.model_registry.health.status import HealthCheckResult, HealthStatus
from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)


def build_models() -> list[ModelRecord]:
    return [
        ModelRecord(
            provider="provider-slm",
            model_id="qwen-0.5b",
            display_name="Qwen 0.5B",
            tier=ModelTier.SLM,
            context_window=32768,
            max_output_tokens=4096,
            pricing=ModelPricing(
                input_per_1m_tokens=0.002,
                output_per_1m_tokens=0.003,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                code=True,
                streaming=True,
            ),
            latency_ms=100.0,
            quality_score=0.82,
            aliases=("qwen-small",),
            enabled=True,
            available=True,
            version="1.0",
        ),
        ModelRecord(
            provider="provider-mlm",
            model_id="model-balanced",
            display_name="Balanced Model",
            tier=ModelTier.MLM,
            context_window=131072,
            max_output_tokens=8192,
            pricing=ModelPricing(
                input_per_1m_tokens=0.006,
                output_per_1m_tokens=0.008,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                reasoning=True,
                code=True,
                vision=True,
                tool_use=True,
                structured_output=True,
                streaming=True,
                long_context=True,
                agentic=True,
            ),
            latency_ms=180.0,
            quality_score=0.90,
            aliases=("balanced", "model-mid"),
            enabled=True,
            available=True,
            version="2.0",
        ),
        ModelRecord(
            provider="provider-llm",
            model_id="model-premium",
            display_name="Premium Model",
            tier=ModelTier.LLM,
            context_window=200000,
            max_output_tokens=16384,
            pricing=ModelPricing(
                input_per_1m_tokens=0.015,
                output_per_1m_tokens=0.020,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                reasoning=True,
                code=True,
                vision=True,
                audio=True,
                tool_use=True,
                structured_output=True,
                streaming=True,
                long_context=True,
                agentic=True,
            ),
            latency_ms=400.0,
            quality_score=0.97,
            aliases=("premium", "model-best"),
            enabled=True,
            available=True,
            version="3.0",
        ),
    ]


def main() -> None:
    models = build_models()

    manager = HealthManager()

    print("=" * 100)
    print("MODELNOW REAL MODEL HEALTH INTEGRATION TEST")
    print("=" * 100)

    # 1. Model registration
    for model in models:
        manager.register(model)

    assert manager.count() == 3

    print("TEST 1 - MODEL HEALTH REGISTRATION: PASS")
    print(f"  Registered health records: {manager.count()}")

    # 2. Initial UNKNOWN state
    slm_id = models[0].qualified_id
    mlm_id = models[1].qualified_id
    llm_id = models[2].qualified_id

    slm_health = manager.get(slm_id)
    mlm_health = manager.get(mlm_id)
    llm_health = manager.get(llm_id)

    assert slm_health is not None
    assert mlm_health is not None
    assert llm_health is not None

    assert slm_health.status == HealthStatus.UNKNOWN
    assert mlm_health.status == HealthStatus.UNKNOWN
    assert llm_health.status == HealthStatus.UNKNOWN

    assert slm_health.consecutive_failures == 0
    assert slm_health.last_checked is None

    print("TEST 2 - INITIAL UNKNOWN STATE: PASS")

    # 3. Successful health observation
    checked_at = datetime.now(timezone.utc)

    manager.record_success(
        slm_id,
        latency_ms=95.0,
        message="SLM provider healthy",
        checked_at=checked_at,
    )

    slm_health = manager.get(slm_id)

    assert slm_health is not None
    assert slm_health.status == HealthStatus.HEALTHY
    assert slm_health.latency_ms == 95.0
    assert slm_health.consecutive_failures == 0
    assert slm_health.last_checked == checked_at
    assert slm_health.message == "SLM provider healthy"

    print("TEST 3 - SUCCESSFUL HEALTH OBSERVATION: PASS")

    # 4. Heartbeat becomes alive after success
    heartbeat = manager._heartbeats[slm_id.lower()]

    assert heartbeat.alive is True
    assert heartbeat.last_seen == checked_at
    assert heartbeat.consecutive_failures == 0

    print("TEST 4 - HEARTBEAT ALIVE STATE: PASS")

    # 5. Health check result
    result = manager.check(slm_id)

    assert isinstance(result, HealthCheckResult)
    assert result.status == HealthStatus.HEALTHY
    assert result.healthy is True
    assert result.available is True
    assert result.latency_ms == 95.0
    assert result.message == "SLM provider healthy"

    print("TEST 5 - HEALTH CHECK RESULT: PASS")

    # 6. First failure -> DEGRADED
    manager.record_failure(
        mlm_id,
        latency_ms=210.0,
        message="Temporary provider failure",
    )

    mlm_health = manager.get(mlm_id)

    assert mlm_health is not None
    assert mlm_health.status == HealthStatus.DEGRADED
    assert mlm_health.consecutive_failures == 1
    assert mlm_health.latency_ms == 210.0
    assert mlm_health.message == "Temporary provider failure"

    print("TEST 6 - FIRST FAILURE -> DEGRADED: PASS")

    # 7. Second failure remains DEGRADED
    manager.record_failure(
        mlm_id,
        latency_ms=220.0,
        message="Second consecutive failure",
    )

    mlm_health = manager.get(mlm_id)

    assert mlm_health is not None
    assert mlm_health.status == HealthStatus.DEGRADED
    assert mlm_health.consecutive_failures == 2

    print("TEST 7 - SECOND FAILURE -> DEGRADED: PASS")

    # 8. Third failure -> UNHEALTHY
    manager.record_failure(
        mlm_id,
        latency_ms=230.0,
        message="Provider unavailable",
    )

    mlm_health = manager.get(mlm_id)

    assert mlm_health is not None
    assert mlm_health.status == HealthStatus.UNHEALTHY
    assert mlm_health.consecutive_failures == 3
    assert mlm_health.latency_ms == 230.0

    print("TEST 8 - THIRD FAILURE -> UNHEALTHY: PASS")

    # 9. Unhealthy model is not available
    unhealthy_result = manager.check(mlm_id)

    assert unhealthy_result.status == HealthStatus.UNHEALTHY
    assert unhealthy_result.healthy is False
    assert unhealthy_result.available is False

    assert mlm_health not in manager.healthy_models()
    assert mlm_health not in manager.available_models()

    print("TEST 9 - UNHEALTHY AVAILABILITY FILTER: PASS")

    # 10. Successful recovery resets failures
    recovery_time = datetime.now(timezone.utc)

    manager.record_success(
        mlm_id,
        latency_ms=175.0,
        message="Provider recovered",
        checked_at=recovery_time,
    )

    mlm_health = manager.get(mlm_id)

    assert mlm_health is not None
    assert mlm_health.status == HealthStatus.HEALTHY
    assert mlm_health.consecutive_failures == 0
    assert mlm_health.latency_ms == 175.0
    assert mlm_health.last_checked == recovery_time
    assert mlm_health.message == "Provider recovered"

    print("TEST 10 - HEALTH RECOVERY: PASS")

    # 11. Healthy and available model collections
    manager.record_success(
        llm_id,
        latency_ms=390.0,
        message="LLM healthy",
    )

    healthy = manager.healthy_models()
    available = manager.available_models()

    assert {item.qualified_id for item in healthy} == {
        slm_id,
        mlm_id,
        llm_id,
    }

    assert {item.qualified_id for item in available} == {
        slm_id,
        mlm_id,
        llm_id,
    }

    print("TEST 11 - HEALTHY / AVAILABLE MODELS: PASS")

    # 12. Average latency
    average = manager.average_latency()

    assert average == (95.0 + 175.0 + 390.0) / 3

    selected_average = manager.average_latency(
        [slm_id, mlm_id]
    )

    assert selected_average == (95.0 + 175.0) / 2

    print("TEST 12 - AVERAGE LATENCY: PASS")
    print(f"  Overall average latency: {average:.2f} ms")

    # 13. Upsert existing health record
    existing = manager.upsert(models[0])

    assert existing.qualified_id == slm_id
    assert manager.count() == 3

    assert manager.get(slm_id).latency_ms == 95.0

    print("TEST 13 - EXISTING MODEL UPSERT: PASS")

    # 14. Upsert new model
    new_model = ModelRecord(
        provider="provider-new",
        model_id="new-model",
        display_name="New Model",
        tier=ModelTier.MLM,
        latency_ms=150.0,
        quality_score=0.85,
    )

    new_health = manager.upsert(new_model)

    assert new_health.qualified_id == new_model.qualified_id
    assert new_health.status == HealthStatus.UNKNOWN
    assert manager.count() == 4

    print("TEST 14 - NEW MODEL UPSERT: PASS")

    # 15. Duplicate register protection
    try:
        manager.register(models[0])
    except ValueError:
        duplicate_rejected = True
    else:
        duplicate_rejected = False

    assert duplicate_rejected is True

    print("TEST 15 - DUPLICATE REGISTRATION PROTECTION: PASS")

    # 16. Invalid model protection
    try:
        manager.register("not-a-model-record")
    except TypeError:
        invalid_model_rejected = True
    else:
        invalid_model_rejected = False

    assert invalid_model_rejected is True

    print("TEST 16 - INVALID MODEL PROTECTION: PASS")

    # 17. Missing model handling
    assert manager.get(
        "provider-missing:model-missing"
    ) is None

    try:
        manager.check("provider-missing:model-missing")
    except KeyError:
        missing_check_rejected = True
    else:
        missing_check_rejected = False

    assert missing_check_rejected is True

    print("TEST 17 - MISSING MODEL HANDLING: PASS")

    # 18. Negative latency protection
    try:
        manager.record_success(
            slm_id,
            latency_ms=-1.0,
        )
    except ValueError:
        negative_success_latency_rejected = True
    else:
        negative_success_latency_rejected = False

    assert negative_success_latency_rejected is True

    try:
        manager.record_failure(
            slm_id,
            latency_ms=-1.0,
        )
    except ValueError:
        negative_failure_latency_rejected = True
    else:
        negative_failure_latency_rejected = False

    assert negative_failure_latency_rejected is True

    print("TEST 18 - NEGATIVE LATENCY PROTECTION: PASS")

    # 19. Heartbeat age
    heartbeat = manager._heartbeats[slm_id.lower()]

    now = datetime.now(timezone.utc)
    heartbeat.mark_alive(now - timedelta(seconds=5))

    age = heartbeat.age_seconds(now)

    assert age is not None
    assert 4.9 <= age <= 5.1

    print("TEST 19 - HEARTBEAT AGE: PASS")
    print(f"  Heartbeat age: {age:.2f} seconds")

    # 20. Clear health state
    manager.clear()

    assert manager.count() == 0
    assert manager.list_all() == []
    assert manager.healthy_models() == []
    assert manager.available_models() == []
    assert manager.average_latency() is None

    print("TEST 20 - HEALTH STATE CLEAR: PASS")

    print()
    print("=" * 100)
    print("MODELNOW REAL MODEL HEALTH INTEGRATION TEST: PASS")
    print("=" * 100)


if __name__ == "__main__":
    main()
