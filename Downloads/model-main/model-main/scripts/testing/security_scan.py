"""
testing/security_scan.py

Run security scans against the project source code and dependencies.

This script performs:
- Bandit (static code security analysis)
- pip-audit (dependency vulnerability analysis)

Usage:
    python testing/security_scan.py

Examples:
    python testing/security_scan.py
    python testing/security_scan.py --skip-bandit
    python testing/security_scan.py --skip-audit

Requirements:
    pip install bandit pip-audit loguru
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from loguru import logger


PROJECT_ROOT = Path(__file__).resolve().parent.parent


class SecurityScanError(Exception):
    """Raised when a security scan fails."""


class SecurityScanner:
    """Run project security analysis."""

    def __init__(
        self,
        project_root: Path,
        run_bandit: bool = True,
        run_audit: bool = True,
    ) -> None:
        self.project_root = project_root
        self.run_bandit_enabled = run_bandit
        self.run_audit_enabled = run_audit

    def run_bandit(self) -> None:
        """Execute Bandit."""

        logger.info("Running Bandit security scan...")

        subprocess.run(
            [
                sys.executable,
                "-m",
                "bandit",
                "-r",
                str(self.project_root),
                "-x",
                ".venv,venv,__pycache__,.git,tests",
            ],
            check=True,
        )

        logger.success("Bandit completed successfully.")

    def run_pip_audit(self) -> None:
        """Execute pip-audit."""

        logger.info("Running dependency vulnerability scan...")

        subprocess.run(
            [
                sys.executable,
                "-m",
                "pip_audit",
            ],
            check=True,
        )

        logger.success("Dependency audit completed successfully.")

    def scan(self) -> None:
        """Run configured security scans."""

        if self.run_bandit_enabled:
            self.run_bandit()

        if self.run_audit_enabled:
            self.run_pip_audit()

        logger.success("Security scan completed successfully.")


def security_scan(
    skip_bandit: bool = False,
    skip_audit: bool = False,
) -> None:
    """Execute security scanning."""

    try:
        scanner = SecurityScanner(
            project_root=PROJECT_ROOT,
            run_bandit=not skip_bandit,
            run_audit=not skip_audit,
        )

        scanner.scan()

    except subprocess.CalledProcessError as exc:
        logger.exception("Security scan failed.")
        raise SecurityScanError(
            "One or more security scans failed."
        ) from exc


def main() -> None:
    """CLI entry point."""

    parser = argparse.ArgumentParser(
        description="Run project security scans."
    )

    parser.add_argument(
        "--skip-bandit",
        action="store_true",
        help="Skip Bandit static analysis.",
    )

    parser.add_argument(
        "--skip-audit",
        action="store_true",
        help="Skip pip-audit dependency scan.",
    )

    args = parser.parse_args()

    security_scan(
        skip_bandit=args.skip_bandit,
        skip_audit=args.skip_audit,
    )


if __name__ == "__main__":
    main()