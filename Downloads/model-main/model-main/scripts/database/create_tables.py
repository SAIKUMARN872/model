"""
database/create_tables.py

Create all database tables.
"""

from sqlalchemy.exc import SQLAlchemyError

from database.base import Base
from database.connection import engine
from logging.logger import logger

# Import all models so SQLAlchemy registers them
import database.models


def create_tables() -> None:
    """
    Create all database tables.
    """
    try:
        logger.info("Creating database tables...")

        Base.metadata.create_all(bind=engine)

        logger.info("All database tables created successfully.")

    except SQLAlchemyError as exc:
        logger.exception(
            "Failed to create database tables.",
            exc_info=exc,
        )
        raise


def drop_tables() -> None:
    """
    Drop all database tables.
    """
    try:
        logger.warning("Dropping all database tables...")

        Base.metadata.drop_all(bind=engine)

        logger.warning("All database tables dropped successfully.")

    except SQLAlchemyError as exc:
        logger.exception(
            "Failed to drop database tables.",
            exc_info=exc,
        )
        raise


if __name__ == "__main__":
    create_tables()