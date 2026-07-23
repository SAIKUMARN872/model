"""
Repository for AI Model database operations.
"""

from __future__ import annotations

from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.model import AIModel


class ModelRepository:
    """
    Repository for CRUD operations on AI models.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, model: AIModel) -> AIModel:
        """
        Create a new AI model.
        """
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return model

    async def get_by_id(self, model_id: int) -> Optional[AIModel]:
        """
        Retrieve a model by its ID.
        """
        result = await self.session.execute(
            select(AIModel).where(AIModel.id == model_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Optional[AIModel]:
        """
        Retrieve a model by its name.
        """
        result = await self.session.execute(
            select(AIModel).where(AIModel.name == name)
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> list[AIModel]:
        """
        Retrieve all models.
        """
        result = await self.session.execute(
            select(AIModel).order_by(AIModel.name)
        )
        return result.scalars().all()

    async def update(self, model: AIModel) -> AIModel:
        """
        Update an existing model.
        """
        await self.session.commit()
        await self.session.refresh(model)
        return model

    async def delete(self, model: AIModel) -> None:
        """
        Delete a model.
        """
        await self.session.delete(model)
        await self.session.commit()

    async def exists(self, model_id: int) -> bool:
        """
        Check if a model exists.
        """
        result = await self.session.execute(
            select(AIModel.id).where(AIModel.id == model_id)
        )
        return result.scalar_one_or_none() is not None

    async def count(self) -> int:
        """
        Count all models.
        """
        result = await self.session.execute(
            select(func.count(AIModel.id))
        )
        return result.scalar_one()

    async def get_active_models(self) -> list[AIModel]:
        """
        Retrieve all active models.
        """
        result = await self.session.execute(
            select(AIModel).where(AIModel.is_active.is_(True))
        )
        return result.scalars().all()