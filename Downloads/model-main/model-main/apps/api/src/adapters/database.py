"""
Database Adapter

Enterprise Database Adapter

Responsibilities
----------------
- Database Connectivity
- Transaction Management
- CRUD Operations
- Health Check
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from config.logging import log


class DatabaseAdapter:
    """
    Enterprise Database Adapter.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    # ==========================================================
    # Execute Query
    # ==========================================================

    async def execute(
        self,
        statement: Any,
        params: dict[str, Any] | None = None,
    ) -> Any:

        try:
            result = await self.session.execute(
                statement,
                params or {},
            )

            return result

        except Exception as exc:
            log.exception(
                "Database execute failed.",
                error=str(exc),
            )
            raise

    # ==========================================================
    # Fetch One
    # ==========================================================

    async def fetch_one(
        self,
        statement: Any,
    ) -> Any:

        result = await self.execute(statement)

        return result.scalar_one_or_none()

    # ==========================================================
    # Fetch All
    # ==========================================================

    async def fetch_all(
        self,
        statement: Any,
    ) -> list[Any]:

        result = await self.execute(statement)

        return result.scalars().all()

    # ==========================================================
    # Add Entity
    # ==========================================================

    async def add(
        self,
        entity: Any,
    ) -> Any:

        self.session.add(entity)

        await self.session.flush()

        return entity

    # ==========================================================
    # Delete Entity
    # ==========================================================

    async def delete(
        self,
        entity: Any,
    ) -> None:

        await self.session.delete(entity)

    # ==========================================================
    # Commit
    # ==========================================================

    async def commit(self) -> None:

        try:

            await self.session.commit()

        except Exception:

            await self.session.rollback()

            raise

    # ==========================================================
    # Rollback
    # ==========================================================

    async def rollback(self) -> None:

        await self.session.rollback()

    # ==========================================================
    # Refresh
    # ==========================================================

    async def refresh(
        self,
        entity: Any,
    ) -> None:

        await self.session.refresh(entity)

    # ==========================================================
    # Health Check
    # ==========================================================

    async def health(self) -> bool:

        try:

            await self.session.execute(
                text("SELECT 1")
            )

            return True

        except Exception as exc:

            log.exception(
                "Database health check failed.",
                error=str(exc),
            )

            return False

    # ==========================================================
    # Close Session
    # ==========================================================

    async def close(self) -> None:

        await self.session.close() 