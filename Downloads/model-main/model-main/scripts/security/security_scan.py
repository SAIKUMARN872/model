"""
security/security_scan.py

Run security checks for the project.

This utility executes common Python security tools such as:
- bandit (static security analysis)
- pip-audit (dependency vulnerability scanning)

Usage:
    python security/security_scan.py

Requirements:
    pip install bandit pip-audit loguru
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from loguru import logger


PROJECT_ROOT = Path(__file__).resolve().parent.parent


class SecurityScanError(Exception):
    """Raised when a security scan fails."""


class SecurityScanner:
    """Run project security scans."""

    def __init__(self, project_root: Path) -> None:
        self.project_root = project_root

    def run_bandit(self) -> None:
        """Run Bandit static security analysis."""

        logger.info("Running Bandit security scan...")

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

        logger.success("Bandit scan completed.")

    def run_pip_audit(self) -> None:
        """Run dependency vulnerability audit."""

        logger.info("Running pip-audit...")

        subprocess.run(
            [
                sys.executable,
                "-m",
                "pip_audit",
            ],
            check=True,
        )

        logger.success("Dependency audit completed.")

    def scan(self) -> None:
        """Execute all security scans."""

        self.run_bandit()
        self.run_pip_audit()

        logger.success("All security scans completed successfully.")


def security_scan() -> None:
    """Run security scanning."""

    try:
        scanner = SecurityScanner(PROJECT_ROOT)
        scanner.scan()

    except subprocess.CalledProcessError as exc:
        logger.exception("Security scan failed.")
        raise SecurityScanError(
            "One or more security checks failed."
        ) from exc


if __name__ == "__main__":
    security_scan()