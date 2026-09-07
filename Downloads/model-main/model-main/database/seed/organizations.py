"""
Database seed for organizations.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.postgres.tables.organization import Organization


DEFAULT_ORGANIZATIONS = [
    {
        "name": "OpenAI",
        "description": "AI Research Organization",
        "email": "contact@openai.com",
        "website": "https://openai.com",
        "phone": "+1-800-000-0000",
        "address": "San Francisco, California",
        "is_active": True,
    },
    {
        "name": "Anthropic",
        "description": "AI Safety Company",
        "email": "contact@anthropic.com",
        "website": "https://anthropic.com",
        "phone": "+1-800-111-1111",
        "address": "San Francisco, California",
        "is_active": True,
    },
]


async def seed_organizations(
    session: AsyncSession,
) -> None:
    """
    Seed default organizations.
    """

    for organization in DEFAULT_ORGANIZATIONS:

        result = await session.execute(
            select(Organization).where(
                Organization.name == organization["name"]
            )
        )

        if result.scalar_one_or_none() is None:
            session.add(
                Organization(**organization)
            )

    await session.commit()