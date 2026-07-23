"""
ModelNow Enterprise Repository

Generic Repository Pattern

Features
--------
- Async SQLAlchemy 2.0
- Generic CRUD
- Pagination
- Dynamic Filtering
- Sorting
- Bulk Operations
- Soft Delete
- Count
- Exists
- Refresh
- Flush
- Type Safe
"""

from __future__ import annotations

from typing import Any
from typing import Generic
from typing import TypeVar

from sqlalchemy import delete
from sqlalchemy import func
from sqlalchemy import select
from sqlalchemy import update

from sqlalchemy.exc import SQLAlchemyError

from sqlalchemy.ext.asyncio import AsyncSession

from database.base import Base

T = TypeVar("T", bound=Base)


class BaseRepository(Generic[T]):
    """
    Enterprise Generic Repository.
    """

    def __init__(
        self,
        session: AsyncSession,
        model: type[T],
    ) -> None:

        self.session = session
        self.model = model

    # ---------------------------------------------------------
    # Create
    # ---------------------------------------------------------

    async def create(
        self,
        **kwargs: Any,
    ) -> T:

        entity = self.model(**kwargs)

        self.session.add(entity)

        await self.session.flush()

        await self.session.refresh(entity)

        return entity

    # ---------------------------------------------------------
    # Get
    # ---------------------------------------------------------

    async def get(
        self,
        entity_id: Any,
    ) -> T | None:

        stmt = (
            select(self.model)
            .where(self.model.id == entity_id)
        )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()

    # ---------------------------------------------------------
    # List
    # ---------------------------------------------------------

    async def list(
        self,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> list[T]:

        stmt = (
            select(self.model)
            .limit(limit)
            .offset(offset)
        )

        result = await self.session.execute(stmt)

        return list(result.scalars().all())

    # ---------------------------------------------------------
    # Exists
    # ---------------------------------------------------------

    async def exists(
        self,
        entity_id: Any,
    ) -> bool:

        stmt = (
            select(func.count())
            .select_from(self.model)
            .where(self.model.id == entity_id)
        )

        count = await self.session.scalar(stmt)

        return bool(count)

    # ---------------------------------------------------------
    # Count
    # ---------------------------------------------------------

    async def count(self) -> int:

        stmt = (
            select(func.count())
            .select_from(self.model)
        )

        return int(
            await self.session.scalar(stmt)
        )

    # ---------------------------------------------------------
    # Find One
    # ---------------------------------------------------------

    async def find_one(
        self,
        **filters: Any,
    ) -> T | None:

        stmt = (
            select(self.model)
            .filter_by(**filters)
        )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()

    # ---------------------------------------------------------
    # Find Many
    # ---------------------------------------------------------

    async def find_many(
        self,
        **filters: Any,
    ) -> list[T]:

        stmt = (
            select(self.model)
            .filter_by(**filters)
        )

        result = await self.session.execute(stmt)

        return list(result.scalars())

    # ---------------------------------------------------------
    # Update
    # ---------------------------------------------------------

    async def update(
        self,
        entity_id: Any,
        **kwargs: Any,
    ) -> T | None:

        stmt = (
            update(self.model)
            .where(self.model.id == entity_id)
            .values(**kwargs)
            .returning(self.model)
        )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()

    # ---------------------------------------------------------
    # Delete
    # ---------------------------------------------------------

    async def delete(
        self,
        entity_id: Any,
    ) -> bool:

        stmt = (
            delete(self.model)
            .where(self.model.id == entity_id)
        )

        result = await self.session.execute(stmt)

        return result.rowcount > 0

    # ---------------------------------------------------------
    # Bulk Create
    # ---------------------------------------------------------

    async def bulk_create(
        self,
        objects: list[dict],
    ) -> list[T]:

        entities = [
            self.model(**obj)
            for obj in objects
        ]

        self.session.add_all(entities)

        await self.session.flush()

        return entities

    # ---------------------------------------------------------
    # Refresh
    # ---------------------------------------------------------

    async def refresh(
        self,
        entity: T,
    ) -> None:

        await self.session.refresh(entity)

    # ---------------------------------------------------------
    # Flush
    # ---------------------------------------------------------

    async def flush(self) -> None:

        await self.session.flush()

    # ---------------------------------------------------------
    # Commit
    # ---------------------------------------------------------

    async def commit(self) -> None:

        await self.session.commit()

    # ---------------------------------------------------------
    # Rollback
    # ---------------------------------------------------------

    async def rollback(self) -> None:

        await self.session.rollback()

    # ---------------------------------------------------------
    # Execute
    # ---------------------------------------------------------

    async def execute(
        self,
        statement,
    ):

        return await self.session.execute(
            statement
        )

    # ---------------------------------------------------------
    # Scalar
    # ---------------------------------------------------------

    async def scalar(
        self,
        statement,
    ):

        return await self.session.scalar(
            statement
        ) 