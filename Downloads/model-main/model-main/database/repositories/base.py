"""
Base repository implementation.

Provides common CRUD operations for SQLAlchemy repositories.
"""

from __future__ import annotations

from typing import Any, Generic, Optional, Type, TypeVar

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    """
    Generic repository for CRUD operations.
    """

    def __init__(
        self,
        session: AsyncSession,
        model: Type[ModelType],
    ) -> None:
        self.session = session
        self.model = model

    async def create(
        self,
        instance: ModelType,
    ) -> ModelType:
        self.session.add(instance)
        await self.session.commit()
        await self.session.refresh(instance)
        return instance

    async def get_by_id(
        self,
        record_id: Any,
    ) -> Optional[ModelType]:
        result = await self.session.execute(
            select(self.model).where(
                self.model.id == record_id
            )
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> list[ModelType]:
        result = await self.session.execute(
            select(self.model)
        )
        return result.scalars().all()

    async def update(
        self,
        instance: ModelType,
    ) -> ModelType:
        await self.session.commit()
        await self.session.refresh(instance)
        return instance

    async def delete(
        self,
        instance: ModelType,
    ) -> None:
        await self.session.delete(instance)
        await self.session.commit()

    async def delete_by_id(
        self,
        record_id: Any,
    ) -> bool:
        result = await self.session.execute(
            delete(self.model).where(
                self.model.id == record_id
            )
        )

        await self.session.commit()

        return result.rowcount > 0

    async def exists(
        self,
        record_id: Any,
    ) -> bool:
        return await self.get_by_id(record_id) is not None

    async def count(self) -> int:
        result = await self.session.execute(
            select(func.count()).select_from(
                self.model
            )
        )
        return result.scalar_one()