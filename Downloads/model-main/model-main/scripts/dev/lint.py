"""
dev/lint.py

Run static analysis and linting for the project.

Usage:
    python dev/lint.py
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from loguru import logger


PROJECT_ROOT = Path(__file__).resolve().parent.parent


class LintError(Exception):
    """Raised when linting fails."""


class Linter:
    """Run project linters."""

    def __init__(self, project_root: Path) -> None:
        self.project_root = project_root

    def run_flake8(self) -> None:
        """Run flake8."""

        logger.info("Running flake8...")

        subprocess.run(
            [
                sys.executable,
                "-m",
                "flake8",
                str(self.project_root),
            ],
            check=True,
        )

    def run_mypy(self) -> None:
        """Run mypy."""

        logger.info("Running mypy...")

        subprocess.run(
            [
                sys.executable,
                "-m",
                "mypy",
                str(self.project_root),
            ],
            check=True,
        )

    def run(self) -> None:
        """Run all configured linters."""

        self.run_flake8()
        self.run_mypy()

        logger.success("Linting completed successfully.")


def lint() -> None:
    """Execute linting."""

    try:
        Linter(PROJECT_ROOT).run()

    except subprocess.CalledProcessError as exc:
        logger.exception("Linting failed.")
        raise LintError(
            "One or more linting checks failed."
        ) from exc


if __name__ == "__main__":
    lint()