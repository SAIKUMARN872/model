"""
Enterprise Migration Manager

Provides a Python interface around Alembic.

Features
--------
- Upgrade
- Downgrade
- Revision
- History
- Current Version
- Stamp
- Check
"""

from __future__ import annotations

from pathlib import Path

from alembic import command
from alembic.config import Config

from config.logging import log


class MigrationManager:
    """
    Enterprise Alembic Migration Manager.
    """

    def __init__(self) -> None:
        self.root_dir = Path(__file__).resolve().parents[4]

        self.alembic_ini = self.root_dir / "alembic.ini"

        self.alembic_dir = self.root_dir / "alembic"

        self.config = Config(str(self.alembic_ini))

        self.config.set_main_option(
            "script_location",
            str(self.alembic_dir),
        )

    def upgrade(
        self,
        revision: str = "head",
    ) -> None:
        """
        Upgrade database.
        """

        log.info(
            "Running database upgrade...",
            revision=revision,
        )

        command.upgrade(
            self.config,
            revision,
        )

        log.info(
            "Database upgraded successfully."
        )

    def downgrade(
        self,
        revision: str = "-1",
    ) -> None:
        """
        Downgrade database.
        """

        log.info(
            "Running database downgrade...",
            revision=revision,
        )

        command.downgrade(
            self.config,
            revision,
        )

        log.info(
            "Database downgraded."
        )

    def create_revision(
        self,
        message: str,
        autogenerate: bool = True,
    ) -> None:
        """
        Create migration revision.
        """

        log.info(
            "Creating migration...",
            message=message,
        )

        command.revision(
            self.config,
            message=message,
            autogenerate=autogenerate,
        )

    def current(self) -> None:
        """
        Show current revision.
        """

        command.current(self.config)

    def history(self) -> None:
        """
        Show migration history.
        """

        command.history(self.config)

    def heads(self) -> None:
        """
        Show migration heads.
        """

        command.heads(self.config)

    def branches(self) -> None:
        """
        Show migration branches.
        """

        command.branches(self.config)

    def stamp(
        self,
        revision: str,
    ) -> None:
        """
        Stamp database.
        """

        command.stamp(
            self.config,
            revision,
        )

    def check(self) -> None:
        """
        Check pending migrations.
        """

        command.check(self.config)


migration_manager = MigrationManager() 