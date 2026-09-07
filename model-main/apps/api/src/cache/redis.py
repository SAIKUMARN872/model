"""
Redis Client

Enterprise Redis Connection Manager

Features
--------
- Async Redis
- Connection Pool
- Health Check
- Singleton Client
"""

from __future__ import annotations

from redis.asyncio import Redis, ConnectionPool

from config.logging import log
from config.settings import settings


class RedisClient:
    """
    Enterprise Redis Client
    """

    def __init__(self) -> None:

        self.pool = ConnectionPool(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD,
            max_connections=settings.REDIS_MAX_CONNECTIONS,
            decode_responses=True,
        )

        self.client = Redis(
            connection_pool=self.pool,
        )

    # ---------------------------------------------------------
    # Get Client
    # ---------------------------------------------------------

    def get_client(self) -> Redis:
        return self.client

    # ---------------------------------------------------------
    # Health Check
    # ---------------------------------------------------------

    async def health(self) -> bool:

        try:
            await self.client.ping()

            log.info("Redis connection established.")

            return True

        except Exception as exc:

            log.exception(
                "Redis connection failed",
                error=str(exc),
            )

            return False

    # ---------------------------------------------------------
    # Close
    # ---------------------------------------------------------

    async def close(self) -> None:

        await self.client.aclose()

        log.info("Redis connection closed.")


# ==========================================================
# Singleton
# ==========================================================

redis_manager = RedisClient()

redis_client = redis_manager.get_client()