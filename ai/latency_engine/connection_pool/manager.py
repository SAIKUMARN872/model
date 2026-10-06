from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .pool import ConnectionPool


@dataclass(frozen=True)
class PoolConfiguration:
    max_size: int = 10
    min_size: int = 0
    acquire_timeout: float = 5.0
    max_idle_seconds: float | None = 300.0


class ConnectionPoolManager:
    """Manages multiple named connection pools."""

    def __init__(self) -> None:
        self._pools: dict[str, ConnectionPool[Any]] = {}

    @staticmethod
    def _validate_name(name: str) -> str:
        normalized = str(name).strip()

        if not normalized:
            raise ValueError("pool name cannot be empty")

        return normalized

    def create_pool(
        self,
        name: str,
        factory,
        *,
        config: PoolConfiguration | None = None,
        max_size: int | None = None,
        min_size: int | None = None,
        acquire_timeout: float | None = None,
        max_idle_seconds: float | None = None,
    ) -> ConnectionPool[Any]:
        """Create and register a named connection pool."""

        pool_name = self._validate_name(name)

        if pool_name in self._pools:
            raise ValueError(
                f"pool already exists: {pool_name}"
            )

        if config is None:
            config = PoolConfiguration(
                max_size=(
                    10
                    if max_size is None
                    else max_size
                ),
                min_size=(
                    0
                    if min_size is None
                    else min_size
                ),
                acquire_timeout=(
                    5.0
                    if acquire_timeout is None
                    else acquire_timeout
                ),
                max_idle_seconds=max_idle_seconds
                if max_idle_seconds is not None
                else 300.0,
            )

        pool = ConnectionPool(
            factory,
            max_size=config.max_size,
            min_size=config.min_size,
            acquire_timeout=config.acquire_timeout,
            max_idle_seconds=config.max_idle_seconds,
        )

        self._pools[pool_name] = pool

        return pool

    def register(
        self,
        name: str,
        pool: ConnectionPool[Any],
    ) -> None:
        """Register an already-created pool."""

        pool_name = self._validate_name(name)

        if pool_name in self._pools:
            raise ValueError(
                f"pool already exists: {pool_name}"
            )

        self._pools[pool_name] = pool

    def get(
        self,
        name: str,
    ) -> ConnectionPool[Any]:
        pool_name = self._validate_name(name)

        try:
            return self._pools[pool_name]
        except KeyError as exc:
            raise KeyError(
                f"unknown connection pool: {pool_name}"
            ) from exc

    def contains(self, name: str) -> bool:
        pool_name = self._validate_name(name)
        return pool_name in self._pools

    def names(self) -> tuple[str, ...]:
        return tuple(self._pools.keys())

    def remove(
        self,
        name: str,
        *,
        close: bool = True,
    ) -> ConnectionPool[Any]:
        """Remove a pool and optionally close it."""

        pool_name = self._validate_name(name)
        pool = self.get(pool_name)

        del self._pools[pool_name]

        if close:
            pool.close()

        return pool

    def acquire(
        self,
        name: str,
        timeout: float | None = None,
    ) -> Any:
        return self.get(name).acquire(timeout=timeout)

    def release(
        self,
        name: str,
        connection: Any,
        *,
        healthy: bool = True,
    ) -> None:
        self.get(name).release(
            connection,
            healthy=healthy,
        )

    def health_check(
        self,
        name: str,
        checker=None,
    ) -> int:
        return self.get(name).health_check(checker)

    def metrics(
        self,
        name: str | None = None,
    ) -> dict[str, Any]:
        """Return metrics for one pool or all pools."""

        if name is not None:
            pool_name = self._validate_name(name)
            return self.get(pool_name).metrics

        return {
            pool_name: pool.metrics
            for pool_name, pool in self._pools.items()
        }

    def close(
        self,
        name: str | None = None,
    ) -> None:
        """Close one pool or all managed pools."""

        if name is not None:
            self.remove(name, close=True)
            return

        for pool in self._pools.values():
            pool.close()

        self._pools.clear()

    def __len__(self) -> int:
        return len(self._pools)

    def __contains__(self, name: str) -> bool:
        return self.contains(name)


__all__ = [
    "PoolConfiguration",
    "ConnectionPoolManager",
]
