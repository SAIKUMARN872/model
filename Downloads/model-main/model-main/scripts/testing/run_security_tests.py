"""
testing/run_security_tests.py

Run automated security tests for the project.

This utility executes:
- Bandit (static security analysis)
- pip-audit (dependency vulnerability scan)

Usage:
    python testing/run_security_tests.py

Requirements:
    pip install bandit pip-audit loguru
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from loguru import logger


PROJECT_ROOT = Path(__file__).resolve().parent.parent


class SecurityTestError(Exception):
    """Raised when one or more security tests fail."""


class SecurityTestRunner:
    """Run security analysis tools."""

    def __init__(self, project_root: Path) -> None:
        self.project_root = project_root

    def run_bandit(self) -> None:
        """Run Bandit."""

        logger.info("Running Bandit...")

        subprocess.run(
            [
                sys.executable,
                "-m",
                "bandit",
                "-r",
                str(self.project_root),
                "-x",
                ".venv,venv,__pycache__,tests",
            ],
            check=True,
        )

        logger.success("Bandit completed successfully.")

    def run_pip_audit(self) -> None:
        """Run pip-audit."""

        logger.info("Running pip-audit...")

        subprocess.run(
            [
                sys.executable,
                "-m",
                "pip_audit",
            ],
            check=True,
        )

        logger.success("pip-audit completed successfully.")

    def run(self) -> None:
        """Run all configured security tests."""

        self.run_bandit()
        self.run_pip_audit()

        logger.success("All security tests passed.")


def run_security_tests() -> None:
    """Execute the security test suite."""

    try:
        runner = SecurityTestRunner(PROJECT_ROOT)
        runner.run()

    except subprocess.CalledProcessError as exc:
        logger.exception("Security testing failed.")
        raise SecurityTestError(
            "One or more security tests failed."
        ) from exc


if __name__ == "__main__":
    run_security_tests()