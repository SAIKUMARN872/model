"""
maintenance/health_check.py

Application health check utility.

Usage:
    python maintenance/health_check.py

Requirements:
    pip install requests loguru
"""

from __future__ import annotations

import argparse
import sys
from typing import Any

import requests
from loguru import logger


class HealthCheckError(Exception):
    """Raised when the health check fails."""


class HealthChecker:
    """Perform health checks against an application endpoint."""

    def __init__(
        self,
        url: str,
        timeout: int = 10,
    ) -> None:
        self.url = url
        self.timeout = timeout

    def check(self) -> dict[str, Any]:
        """
        Execute the health check.

        Returns:
            Health check response.
        """

        logger.info("Checking application health: {}", self.url)

        response = requests.get(
            self.url,
            timeout=self.timeout,
        )

        response.raise_for_status()

        try:
            data = response.json()
        except ValueError:
            data = {
                "status": "healthy",
                "message": response.text,
            }

        logger.success("Health check passed.")

        return data


def health_check(
    url: str,
    timeout: int = 10,
) -> dict[str, Any]:
    """Run the health check."""

    try:
        checker = HealthChecker(
            url=url,
            timeout=timeout,
        )

        return checker.check()

    except requests.RequestException as exc:
        logger.exception("Health check failed.")
        raise HealthCheckError(
            f"Unable to reach application: {url}"
        ) from exc


def main() -> None:
    """CLI entry point."""

    parser = argparse.ArgumentParser(
        description="Application Health Check"
    )

    parser.add_argument(
        "--url",
        default="http://localhost:8000/health",
        help="Health endpoint URL.",
    )

    parser.add_argument(
        "--timeout",
        type=int,
        default=10,
        help="Request timeout (seconds).",
    )

    args = parser.parse_args()

    try:
        result = health_check(
            url=args.url,
            timeout=args.timeout,
        )

        logger.info(result)

    except HealthCheckError:
        sys.exit(1)


if __name__ == "__main__":
    main()