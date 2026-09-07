"""
Repository for AI models.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.postgres.repositories.base import BaseRepository
from app.database.postgres.tables.model import AIModel


class ModelRepository(BaseRepository[AIModel]):
    """
    Repository for AI models.
    """

    def __init__(
        self,
        session: AsyncSession,
    ) -> None:
        super().__init__(
            session=session,
            model=AIModel,
        )

    async def get_by_name(
        self,
        name: str,
    ) -> AIModel | None:
        result = await self.session.execute(
            select(AIModel).where(
                AIModel.name == name
            )
        )
        return result.scalar_one_or_none()

    async def get_by_provider(
        self,
        provider: str,
    ) -> list[AIModel]:
        result = await self.session.execute(
            select(AIModel).where(
                AIModel.provider == provider
            )
        )
        return result.scalars().all()

    async def get_active_models(
        self,
    ) -> list[AIModel]:
        result = await self.session.execute(
            select(AIModel).where(
                AIModel.is_active.is_(True)
            )
        )
        return result.scalars().all()

    async def search(
        self,
        keyword: str,
    ) -> list[AIModel]:
        result = await self.session.execute(
            select(AIModel).where(
                AIModel.name.ilike(f"%{keyword}%")
            )
        )
        return result.scalars().all()