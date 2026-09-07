"""
testing/install_dependencies.py

Install project dependencies from a requirements file.

Usage:
    python testing/install_dependencies.py

Examples:
    python testing/install_dependencies.py
    python testing/install_dependencies.py --file requirements-dev.txt

Requirements:
    pip install loguru
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from loguru import logger


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_REQUIREMENTS = PROJECT_ROOT / "requirements.txt"


class DependencyInstallationError(Exception):
    """Raised when dependency installation fails."""


class DependencyInstaller:
    """Install Python dependencies using pip."""

    def __init__(self, requirements_file: Path) -> None:
        self.requirements_file = requirements_file

    def validate(self) -> None:
        """Validate the requirements file."""

        if not self.requirements_file.exists():
            raise DependencyInstallationError(
                f"Requirements file not found: {self.requirements_file}"
            )

    def install(self) -> None:
        """Install dependencies."""

        self.validate()

        logger.info(
            "Installing dependencies from {}",
            self.requirements_file,
        )

        subprocess.run(
            [
                sys.executable,
                "-m",
                "pip",
                "install",
                "-r",
                str(self.requirements_file),
            ],
            check=True,
        )

        logger.success("Dependencies installed successfully.")


def install_dependencies(requirements_file: Path) -> None:
    """Install project dependencies."""

    try:
        installer = DependencyInstaller(requirements_file)
        installer.install()

    except subprocess.CalledProcessError as exc:
        logger.exception("Dependency installation failed.")
        raise DependencyInstallationError(
            "Failed to install project dependencies."
        ) from exc


def main() -> None:
    """CLI entry point."""

    parser = argparse.ArgumentParser(
        description="Install project dependencies."
    )

    parser.add_argument(
        "--file",
        default=str(DEFAULT_REQUIREMENTS),
        help="Path to the requirements file.",
    )

    args = parser.parse_args()

    install_dependencies(
        Path(args.file),
    )


if __name__ == "__main__":
    main()