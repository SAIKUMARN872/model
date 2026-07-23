"""
AI Model database queries.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.model import AIModel


class ModelQuery:
    """
    AI model queries.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, model_id: int) -> AIModel | None:
        stmt = select(AIModel).where(AIModel.id == model_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> AIModel | None:
        stmt = select(AIModel).where(AIModel.name == name)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_all(self) -> list[AIModel]:
        stmt = select(AIModel).order_by(AIModel.name)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()) 