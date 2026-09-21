"""
Enterprise Database Connection

Features
--------
✓ Async SQLAlchemy 2.0
✓ PostgreSQL
✓ Connection Pooling
✓ Pool Health Check
✓ Pool Recycle
✓ SSL Support
✓ Engine Singleton
✓ Production Ready
"""

from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from config.logging import log
from config.settings import settings


class Database:
    """
    Enterprise Database Manager.
    """

    def __init__(self) -> None:
        self.engine: AsyncEngine = create_async_engine(
            settings.DATABASE_URL,

            echo=settings.DATABASE_ECHO,

            future=True,

            pool_size=settings.DATABASE_POOL_SIZE,

            max_overflow=settings.DATABASE_MAX_OVERFLOW,

            pool_timeout=settings.DATABASE_POOL_TIMEOUT,

            pool_pre_ping=True,

            pool_recycle=3600,

            pool_use_lifo=True,

            connect_args={
                "server_settings": {
                    "application_name": settings.APP_NAME,
                }
            },
        )

        self.session_factory = async_sessionmaker(
            bind=self.engine,

            expire_on_commit=False,

            autoflush=False,

            autocommit=False,

            class_=AsyncSession,
        )

    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        """
        Database Session Generator.
        """

        async with self.session_factory() as session:
            try:
                yield session

                await session.commit()

            except Exception:
                await session.rollback()
                raise

            finally:
                await session.close()

    async def health(self) -> bool:
        """
        Database Health Check.
        """

        try:
            async with self.engine.begin() as conn:
                await conn.execute(
                    text("SELECT 1")
                )

            return True

        except Exception as exc:
            log.exception(
                "Database Health Failed",
                error=str(exc),
            )

            return False

    async def close(self) -> None:
        """
        Dispose Connection Pool.
        """

        await self.engine.dispose()

        log.info(
            "Database connection pool closed."
        )


database = Database() 