"""
database/create_database.py

Create all database tables.
"""

from sqlalchemy import text

from database.connection import engine
from database.base import Base
from logging.logger import logger

# Import all models so they are registered with Base.metadata
from database.models.user import User
from database.models.organization import Organization
from database.models.project import Project
from database.models.api_key import APIKey
from database.models.subscription import Subscription
from database.models.transaction import Transaction
from database.models.workspace import Workspace
from database.models.permission import Permission
from database.models.model import AIModel
from database.models.model_usage import ModelUsage
from database.models.connection import Connection
from database.models.billing import Billing
from database.models.audit_log import AuditLog


def create_tables() -> None:
    """
    Create all database tables.
    """
    try:
        logger.info("Creating database tables...")

        Base.metadata.create_all(bind=engine)

        logger.info("Database tables created successfully.")

    except Exception as exc:
        logger.exception(
            "Failed to create database tables.",
            exc_info=exc,
        )
        raise


def test_database_connection() -> None:
    """
    Verify database connection.
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        logger.info("Database connection successful.")

    except Exception as exc:
        logger.exception(
            "Database connection failed.",
            exc_info=exc,
        )
        raise


def initialize_database() -> None:
    """
    Initialize the database.
    """
    test_database_connection()
    create_tables()


if __name__ == "__main__":
    initialize_database()