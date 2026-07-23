"""
testing/environment_setup.py

Validate the local development/testing environment.

Checks:
- Python version
- Required tools
- Required Python packages
- Environment variables

Usage:
    python testing/environment_setup.py

Requirements:
    pip install loguru
"""

from __future__ import annotations

import os
import shutil
import sys
from importlib.util import find_spec

from loguru import logger


MIN_PYTHON_VERSION = (3, 11)

REQUIRED_PACKAGES = [
    "fastapi",
    "uvicorn",
    "pytest",
    "requests",
    "loguru",
]

REQUIRED_TOOLS = [
    "git",
]

OPTIONAL_TOOLS = [
    "docker",
    "kubectl",
]

REQUIRED_ENV_VARS = [
    "DATABASE_URL",
    "SECRET_KEY",
]


class EnvironmentSetupError(Exception):
    """Raised when environment validation fails."""


class EnvironmentValidator:
    """Validate the development environment."""

    @staticmethod
    def check_python() -> None:
        """Check the Python version."""

        if sys.version_info < MIN_PYTHON_VERSION:
            raise EnvironmentSetupError(
                f"Python {MIN_PYTHON_VERSION[0]}.{MIN_PYTHON_VERSION[1]} "
                "or later is required."
            )

        logger.success(
            "Python {}.{}.{} detected.",
            *sys.version_info[:3],
        )

    @staticmethod
    def check_packages() -> None:
        """Check required Python packages."""

        missing = []

        for package in REQUIRED_PACKAGES:
            if find_spec(package) is None:
                missing.append(package)

        if missing:
            raise EnvironmentSetupError(
                f"Missing packages: {', '.join(missing)}"
            )

        logger.success("All required Python packages are installed.")

    @staticmethod
    def check_tools() -> None:
        """Check required command-line tools."""

        missing = []

        for tool in REQUIRED_TOOLS:
            if shutil.which(tool) is None:
                missing.append(tool)

        if missing:
            raise EnvironmentSetupError(
                f"Missing tools: {', '.join(missing)}"
            )

        logger.success("Required command-line tools found.")

        for tool in OPTIONAL_TOOLS:
            if shutil.which(tool):
                logger.info("{} available.", tool)
            else:
                logger.warning("{} not installed (optional).", tool)

    @staticmethod
    def check_environment_variables() -> None:
        """Check required environment variables."""

        missing = [
            var
            for var in REQUIRED_ENV_VARS
            if not os.getenv(var)
        ]

        if missing:
            logger.warning(
                "Missing environment variables: {}",
                ", ".join(missing),
            )
        else:
            logger.success("Environment variables verified.")

    def validate(self) -> None:
        """Run all validation checks."""

        self.check_python()
        self.check_packages()
        self.check_tools()
        self.check_environment_variables()

        logger.success("Environment validation completed successfully.")


def environment_setup() -> None:
    """Validate the environment."""

    try:
        EnvironmentValidator().validate()

    except EnvironmentSetupError:
        logger.exception("Environment validation failed.")
        raise


if __name__ == "__main__":
    environment_setup()