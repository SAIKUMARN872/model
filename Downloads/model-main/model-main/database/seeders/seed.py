"""
Database seeding entry point.
"""

from __future__ import annotations

import logging

from sqlalchemy.ext.asyncio import AsyncSession

from .default_models import seed_default_models
from .default_organizations import seed_default_organizations
from .default_users import seed_default_users

logger = logging.getLogger(__name__)


async def seed_database(
    session: AsyncSession,
) -> None:
    """
    Seed all default application data.
    """

    logger.info("Starting database seeding...")

    try:
        await seed_default_organizations(session)
        logger.info("Organizations seeded.")

        await seed_default_models(session)
        logger.info("Models seeded.")

        await seed_default_users(session)
        logger.info("Users seeded.")

        logger.info("Database seeding completed successfully.")

    except Exception:
        logger.exception("Database seeding failed.")
        raise