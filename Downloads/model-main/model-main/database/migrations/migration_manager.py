"""
Migration manager.

Provides utilities to run Alembic migrations programmatically.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

from alembic import command
from alembic.config import Config

logger = logging.getLogger(__name__)


class MigrationManager:
    """Manage Alembic database migrations."""

    def __init__(
        self,
        alembic_ini: str = "alembic.ini",
        database_url: Optional[str] = None,
    ) -> None:
        self.config = Config(alembic_ini)

        if database_url:
            self.config.set_main_option(
                "sqlalchemy.url",
                database_url,
            )

        project_root = Path(alembic_ini).resolve().parent
        script_location = project_root / "alembic"

        if script_location.exists():
            self.config.set_main_option(
                "script_location",
                str(script_location),
            )

    def upgrade(self, revision: str = "head") -> None:
        """Upgrade database to a revision."""
        logger.info("Upgrading database to %s", revision)
        command.upgrade(self.config, revision)
        logger.info("Database upgraded successfully.")

    def downgrade(self, revision: str = "-1") -> None:
        """Downgrade database."""
        logger.info("Downgrading database to %s", revision)
        command.downgrade(self.config, revision)
        logger.info("Database downgraded successfully.")

    def revision(
        self,
        message: str,
        autogenerate: bool = True,
    ) -> None:
        """Create a new migration revision."""
        logger.info("Creating migration: %s", message)

        command.revision(
            self.config,
            message=message,
            autogenerate=autogenerate,
        )

        logger.info("Migration created successfully.")

    def current(self) -> None:
        """Display current database revision."""
        command.current(self.config)

    def history(self) -> None:
        """Display migration history."""
        command.history(self.config)

    def heads(self) -> None:
        """Display current migration heads."""
        command.heads(self.config)

    def stamp(self, revision: str = "head") -> None:
        """Stamp the database with a revision without running migrations."""
        command.stamp(self.config, revision)


def get_migration_manager(
    database_url: Optional[str] = None,
) -> MigrationManager:
    """
    Factory function for MigrationManager.
    """
    return MigrationManager(database_url=database_url)