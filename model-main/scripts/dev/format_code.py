"""
dev/format_code.py

Format the project source code using Black and isort.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from loguru import logger


PROJECT_ROOT = Path(__file__).resolve().parent.parent


class CodeFormatterError(Exception):
    """Raised when code formatting fails."""


class CodeFormatter:
    """Format Python source code."""

    def __init__(self, project_root: Path) -> None:
        self.project_root = project_root

    def run(self) -> None:
        """Run all formatters."""

        logger.info("Running isort...")

        subprocess.run(
            [
                sys.executable,
                "-m",
                "isort",
                str(self.project_root),
            ],
            check=True,
        )

        logger.info("Running Black...")

        subprocess.run(
            [
                sys.executable,
                "-m",
                "black",
                str(self.project_root),
            ],
            check=True,
        )

        logger.success("Code formatting completed successfully.")


def format_code() -> None:
    """Format the project."""

    try:
        formatter = CodeFormatter(PROJECT_ROOT)
        formatter.run()

    except subprocess.CalledProcessError as exc:
        logger.exception("Formatting failed.")
        raise CodeFormatterError(
            "Failed to format project."
        ) from exc


if __name__ == "__main__":
    format_code()