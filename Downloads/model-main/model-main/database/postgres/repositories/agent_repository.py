"""
Repository for Agent database operations.
"""

from __future__ import annotations

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent import Agent


class AgentRepository:
    """
    Repository for CRUD operations on Agent.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, agent: Agent) -> Agent:
        """
        Create a new agent.
        """
        self.session.add(agent)
        await self.session.commit()
        await self.session.refresh(agent)
        return agent

    async def get_by_id(self, agent_id: int) -> Optional[Agent]:
        """
        Get an agent by ID.
        """
        result = await self.session.execute(
            select(Agent).where(Agent.id == agent_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Optional[Agent]:
        """
        Get an agent by name.
        """
        result = await self.session.execute(
            select(Agent).where(Agent.name == name)
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> List[Agent]:
        """
        Retrieve all agents.
        """
        result = await self.session.execute(
            select(Agent).order_by(Agent.id)
        )
        return result.scalars().all()

    async def update(self, agent: Agent) -> Agent:
        """
        Update an existing agent.
        """
        await self.session.commit()
        await self.session.refresh(agent)
        return agent

    async def delete(self, agent: Agent) -> None:
        """
        Delete an agent.
        """
        await self.session.delete(agent)
        await self.session.commit()

    async def exists(self, agent_id: int) -> bool:
        """
        Check whether an agent exists.
        """
        result = await self.session.execute(
            select(Agent.id).where(Agent.id == agent_id)
        )
        return result.scalar_one_or_none() is not None

    async def count(self) -> int:
        """
        Count all agents.
        """
        result = await self.session.execute(
            select(Agent)
        )
        return len(result.scalars().all())