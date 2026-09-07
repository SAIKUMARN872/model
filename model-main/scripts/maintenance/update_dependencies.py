"""
maintenance/update_dependencies.py

Utility to check and update project dependencies.
"""

from __future__ import annotations

import subprocess
import sys

from logging.logger import logger


class DependencyManager:
    """
    Manage Python package dependencies.
    """

    @staticmethod
    def check_outdated() -> None:
        """
        Display outdated packages.
        """
        try:
            logger.info("Checking for outdated packages...")

            subprocess.run(
                [
                    sys.executable,
                    "-m",
                    "pip",
                    "list",
                    "--outdated",
                ],
                check=True,
            )

            logger.info("Dependency check completed.")

        except subprocess.CalledProcessError as exc:
            logger.exception(
                "Failed to check dependencies.",
                exc_info=exc,
            )
            raise

    @staticmethod
    def update_pip() -> None:
        """
        Update pip to the latest version.
        """
        try:
            logger.info("Updating pip...")

            subprocess.run(
                [
                    sys.executable,
                    "-m",
                    "pip",
                    "install",
                    "--upgrade",
                    "pip",
                ],
                check=True,
            )

            logger.info("pip updated successfully.")

        except subprocess.CalledProcessError as exc:
            logger.exception(
                "Failed to update pip.",
                exc_info=exc,
            )
            raise

    @staticmethod
    def update_requirements() -> None:
        """
        Upgrade packages listed in requirements.txt.
        """
        try:
            logger.info("Updating project dependencies...")

            subprocess.run(
                [
                    sys.executable,
                    "-m",
                    "pip",
                    "install",
                    "--upgrade",
                    "-r",
                    "requirements.txt",
                ],
                check=True,
            )

            logger.info("Dependencies updated successfully.")

        except subprocess.CalledProcessError as exc:
            logger.exception(
                "Failed to update dependencies.",
                exc_info=exc,
            )
            raise


dependency_manager = DependencyManager()


def run_updates() -> None:
    """
    Execute dependency maintenance tasks.
    """
    dependency_manager.check_outdated()
    dependency_manager.update_pip()
    dependency_manager.update_requirements()


if __name__ == "__main__":
    run_updates()