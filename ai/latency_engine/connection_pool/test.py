from __future__ import annotations

from .health import ConnectionHealthChecker
from .manager import ConnectionPoolManager, PoolConfiguration
from .pool import (
    ConnectionPool,
    ConnectionPoolError,
    PoolExhaustedError,
)


class TestConnection:
    def __init__(self, connection_id: int) -> None:
        self.connection_id = connection_id
        self.closed = False

    def close(self) -> None:
        self.closed = True


def main() -> None:
    counter = {"value": 0}

    def factory() -> TestConnection:
        counter["value"] += 1
        return TestConnection(counter["value"])

    pool = ConnectionPool(
        factory,
        max_size=2,
        min_size=1,
        acquire_timeout=0.01,
        max_idle_seconds=300.0,
    )

    assert pool.size == 1
    assert pool.available == 1
    assert pool.in_use == 0
    print("POOL INITIALIZATION: PASS")

    first = pool.acquire()

    assert isinstance(first, TestConnection)
    assert pool.in_use == 1
    assert pool.available == 0
    print("ACQUIRE: PASS")

    pool.release(first)

    assert pool.available == 1
    assert pool.in_use == 0
    print("RELEASE: PASS")

    second = pool.acquire()

    assert second is first

    pool.release(second)

    assert counter["value"] == 1
    print("CONNECTION REUSE: PASS")

    first = pool.acquire()
    second = pool.acquire()

    assert pool.size == 2
    assert pool.in_use == 2

    try:
        pool.acquire(timeout=0.01)
    except PoolExhaustedError:
        exhausted = True
    else:
        exhausted = False

    assert exhausted is True

    pool.release(first)
    pool.release(second)

    print("POOL CAPACITY: PASS")

    unhealthy = pool.acquire()
    pool.release(unhealthy, healthy=False)

    assert pool.size >= pool.min_size
    print("UNHEALTHY CONNECTION: PASS")

    metrics = pool.metrics

    assert metrics["total_created"] >= 1
    assert metrics["total_acquired"] >= 3
    assert metrics["total_released"] >= 3
    assert metrics["total_destroyed"] >= 1
    print("POOL METRICS: PASS")

    health_checker = ConnectionHealthChecker()

    connection = TestConnection(100)

    result = health_checker.check(connection)

    assert result.healthy is True
    assert result.latency_ms >= 0.0

    stats = health_checker.statistics

    assert stats.checks == 1
    assert stats.healthy == 1
    assert stats.unhealthy == 0
    assert stats.success_rate == 1.0
    print("HEALTH CHECK: PASS")

    class UnhealthyConnection:
        healthy = False

    unhealthy_result = health_checker.check(
        UnhealthyConnection()
    )

    assert unhealthy_result.healthy is False

    assert health_checker.statistics.unhealthy == 1
    print("UNHEALTHY CHECK: PASS")

    health_checker.reset()

    assert health_checker.statistics.checks == 0
    print("HEALTH RESET: PASS")

    manager = ConnectionPoolManager()

    managed = manager.create_pool(
        "openai",
        factory,
        config=PoolConfiguration(
            max_size=3,
            min_size=1,
            acquire_timeout=0.01,
            max_idle_seconds=300.0,
        ),
    )

    assert manager.contains("openai")
    assert manager.get("openai") is managed
    assert manager.names() == ("openai",)
    assert len(manager) == 1
    print("POOL MANAGER REGISTRATION: PASS")

    connection = manager.acquire("openai")

    assert isinstance(connection, TestConnection)

    manager.release(
        "openai",
        connection,
    )

    manager_metrics = manager.metrics("openai")

    assert manager_metrics["total_acquired"] >= 1
    assert manager_metrics["total_released"] >= 1
    print("POOL MANAGER ACQUIRE/RELEASE: PASS")

    second_pool = ConnectionPool(
        factory,
        max_size=2,
    )

    manager.register(
        "anthropic",
        second_pool,
    )

    assert set(manager.names()) == {
        "openai",
        "anthropic",
    }

    assert set(manager.metrics().keys()) == {
        "openai",
        "anthropic",
    }

    print("MULTI-POOL MANAGEMENT: PASS")

    removed = manager.remove(
        "anthropic",
        close=True,
    )

    assert removed is second_pool
    assert not manager.contains("anthropic")
    assert second_pool.closed is True
    print("POOL REMOVAL: PASS")

    try:
        manager.get("missing")
    except KeyError:
        missing_pool = True
    else:
        missing_pool = False

    assert missing_pool is True
    print("MISSING POOL HANDLING: PASS")

    try:
        ConnectionPool(
            factory,
            max_size=0,
        )
    except ValueError:
        invalid_pool = True
    else:
        invalid_pool = False

    assert invalid_pool is True
    print("POOL VALIDATION: PASS")

    try:
        pool.release(TestConnection(999))
    except ConnectionPoolError:
        foreign_connection = True
    else:
        foreign_connection = False

    assert foreign_connection is True
    print("FOREIGN CONNECTION HANDLING: PASS")

    manager.close()

    assert len(manager) == 0

    pool.close()

    assert pool.closed is True

    pool.close()

    print("POOL SHUTDOWN: PASS")

    print("MODELNOW LATENCY CONNECTION POOL TEST: PASS")


if __name__ == "__main__":
    main()
