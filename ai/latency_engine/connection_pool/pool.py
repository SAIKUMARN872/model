from __future__ import annotations

from dataclasses import dataclass
from threading import Condition
from time import monotonic
from typing import Generic, TypeVar


T = TypeVar("T")


class ConnectionPoolError(RuntimeError):
    """Base error for connection-pool operations."""


class PoolExhaustedError(ConnectionPoolError):
    """Raised when no connection can be acquired within the timeout."""


@dataclass
class PooledConnection(Generic[T]):
    connection: T
    created_at: float
    last_used_at: float
    in_use: bool = False
    healthy: bool = True
    uses: int = 0


class ConnectionPool(Generic[T]):
    """Thread-safe reusable connection pool."""

    def __init__(
        self,
        factory,
        *,
        max_size: int = 10,
        min_size: int = 0,
        acquire_timeout: float = 5.0,
        max_idle_seconds: float | None = 300.0,
    ) -> None:
        if max_size <= 0:
            raise ValueError("max_size must be positive")

        if min_size < 0:
            raise ValueError("min_size must be non-negative")

        if min_size > max_size:
            raise ValueError("min_size cannot exceed max_size")

        if acquire_timeout < 0:
            raise ValueError("acquire_timeout cannot be negative")

        if max_idle_seconds is not None and max_idle_seconds < 0:
            raise ValueError("max_idle_seconds cannot be negative")

        if not callable(factory):
            raise TypeError("factory must be callable")

        self._factory = factory
        self._max_size = max_size
        self._min_size = min_size
        self._acquire_timeout = acquire_timeout
        self._max_idle_seconds = max_idle_seconds

        self._connections: list[PooledConnection[T]] = []
        self._closed = False
        self._condition = Condition()

        self._total_created = 0
        self._total_acquired = 0
        self._total_released = 0
        self._total_destroyed = 0

        self._initialize_minimum()

    @property
    def max_size(self) -> int:
        return self._max_size

    @property
    def min_size(self) -> int:
        return self._min_size

    @property
    def size(self) -> int:
        with self._condition:
            return len(self._connections)

    @property
    def available(self) -> int:
        with self._condition:
            return sum(
                1
                for item in self._connections
                if not item.in_use and item.healthy
            )

    @property
    def in_use(self) -> int:
        with self._condition:
            return sum(
                1
                for item in self._connections
                if item.in_use
            )

    @property
    def closed(self) -> bool:
        with self._condition:
            return self._closed

    @property
    def metrics(self) -> dict[str, int]:
        with self._condition:
            return {
                "size": len(self._connections),
                "available": sum(
                    1
                    for item in self._connections
                    if not item.in_use and item.healthy
                ),
                "in_use": sum(
                    1
                    for item in self._connections
                    if item.in_use
                ),
                "total_created": self._total_created,
                "total_acquired": self._total_acquired,
                "total_released": self._total_released,
                "total_destroyed": self._total_destroyed,
            }

    def _initialize_minimum(self) -> None:
        for _ in range(self._min_size):
            connection = self._create_connection()
            self._connections.append(connection)

    def _create_connection(self) -> PooledConnection[T]:
        connection = self._factory()
        now = monotonic()

        self._total_created += 1

        return PooledConnection(
            connection=connection,
            created_at=now,
            last_used_at=now,
        )

    def _close_connection(self, item: PooledConnection[T]) -> None:
        connection = item.connection

        close = getattr(connection, "close", None)

        if callable(close):
            close()

        self._total_destroyed += 1

    def _remove_idle_connections(self) -> None:
        if self._max_idle_seconds is None:
            return

        now = monotonic()

        survivors: list[PooledConnection[T]] = []

        for item in self._connections:
            if item.in_use:
                survivors.append(item)
                continue

            if len(survivors) < self._min_size:
                survivors.append(item)
                continue

            idle_seconds = now - item.last_used_at

            if idle_seconds > self._max_idle_seconds:
                self._close_connection(item)
            else:
                survivors.append(item)

        self._connections = survivors

    def _find_available(self) -> PooledConnection[T] | None:
        self._remove_idle_connections()

        for item in self._connections:
            if not item.in_use and item.healthy:
                item.in_use = True
                item.uses += 1
                item.last_used_at = monotonic()

                self._total_acquired += 1

                return item

        return None

    def acquire(self, timeout: float | None = None) -> T:
        """Acquire a healthy connection, waiting until timeout if necessary."""

        wait_timeout = (
            self._acquire_timeout
            if timeout is None
            else timeout
        )

        if wait_timeout < 0:
            raise ValueError("timeout cannot be negative")

        deadline = monotonic() + wait_timeout

        with self._condition:
            if self._closed:
                raise ConnectionPoolError("connection pool is closed")

            while True:
                item = self._find_available()

                if item is not None:
                    return item.connection

                if len(self._connections) < self._max_size:
                    item = self._create_connection()
                    item.in_use = True
                    item.uses += 1
                    item.last_used_at = monotonic()

                    self._connections.append(item)
                    self._total_acquired += 1

                    return item.connection

                remaining = deadline - monotonic()

                if remaining <= 0:
                    raise PoolExhaustedError(
                        "no connection available within timeout"
                    )

                self._condition.wait(timeout=remaining)

                if self._closed:
                    raise ConnectionPoolError("connection pool is closed")

    def release(
        self,
        connection: T,
        *,
        healthy: bool = True,
    ) -> None:
        """Return a connection to the pool."""

        with self._condition:
            for item in self._connections:
                if item.connection is connection:
                    if not item.in_use:
                        raise ConnectionPoolError(
                            "connection has already been released"
                        )

                    item.in_use = False
                    item.healthy = healthy
                    item.last_used_at = monotonic()

                    self._total_released += 1

                    if not healthy:
                        self._connections.remove(item)
                        self._close_connection(item)

                    self._condition.notify()

                    return

            raise ConnectionPoolError(
                "connection does not belong to this pool"
            )

    def discard(self, connection: T) -> None:
        """Remove and close a connection permanently."""

        with self._condition:
            for item in self._connections:
                if item.connection is connection:
                    self._connections.remove(item)
                    self._close_connection(item)
                    self._condition.notify()
                    return

            raise ConnectionPoolError(
                "connection does not belong to this pool"
            )

    def health_check(self, checker=None) -> int:
        """Check idle connections and remove unhealthy ones."""

        removed = 0

        with self._condition:
            for item in list(self._connections):
                if item.in_use:
                    continue

                healthy = (
                    checker(item.connection)
                    if checker is not None
                    else True
                )

                item.healthy = bool(healthy)

                if not item.healthy and len(self._connections) > self._min_size:
                    self._connections.remove(item)
                    self._close_connection(item)
                    removed += 1

            self._condition.notify_all()

        return removed

    def clear(self) -> None:
        """Close all idle connections while preserving active ones."""

        with self._condition:
            for item in list(self._connections):
                if item.in_use:
                    continue

                self._connections.remove(item)
                self._close_connection(item)

            self._condition.notify_all()

    def close(self) -> None:
        """Close the pool and all connections."""

        with self._condition:
            if self._closed:
                return

            for item in self._connections:
                self._close_connection(item)

            self._connections.clear()
            self._closed = True

            self._condition.notify_all()
