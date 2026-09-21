"""
security/test_permission.py

Test Role-Based Access Control (RBAC) and permission enforcement.

Features:
- Verify authorized access
- Verify forbidden access
- Verify unauthenticated access

Usage:
    python security/test_permission.py

Examples:
    python security/test_permission.py \
        --url http://localhost:8000/api/v1/admin/users \
        --admin-token ADMIN_TOKEN \
        --user-token USER_TOKEN

Requirements:
    pip install requests loguru
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass

import requests
from loguru import logger


DEFAULT_TIMEOUT = 10


@dataclass(slots=True)
class PermissionTestResult:
    """Permission test result."""

    test_name: str
    expected_status: int
    actual_status: int
    passed: bool


class PermissionTestError(Exception):
    """Raised when permission tests fail."""


class PermissionTester:
    """Test endpoint authorization and permissions."""

    def __init__(
        self,
        url: str,
        admin_token: str,
        user_token: str,
        timeout: int = DEFAULT_TIMEOUT,
    ) -> None:
        self.url = url
        self.admin_token = admin_token
        self.user_token = user_token
        self.timeout = timeout

    @staticmethod
    def _headers(token: str | None) -> dict[str, str]:
        """Build request headers."""

        if not token:
            return {}

        return {
            "Authorization": f"Bearer {token}",
        }

    def _request(self, token: str | None) -> requests.Response:
        """Execute request."""

        return requests.get(
            self.url,
            headers=self._headers(token),
            timeout=self.timeout,
        )

    def run(self) -> list[PermissionTestResult]:
        """Run permission tests."""

        logger.info("Running permission tests...")

        results: list[PermissionTestResult] = []

        # Admin access (expected success)
        response = self._request(self.admin_token)

        results.append(
            PermissionTestResult(
                test_name="Admin Access",
                expected_status=200,
                actual_status=response.status_code,
                passed=response.status_code == 200,
            )
        )

        # Normal user (expected forbidden)
        response = self._request(self.user_token)

        results.append(
            PermissionTestResult(
                test_name="User Access",
                expected_status=403,
                actual_status=response.status_code,
                passed=response.status_code == 403,
            )
        )

        # No authentication
        response = self._request(None)

        results.append(
            PermissionTestResult(
                test_name="Anonymous Access",
                expected_status=401,
                actual_status=response.status_code,
                passed=response.status_code in (401, 403),
            )
        )

        logger.success("Permission tests completed.")

        return results


def main() -> None:
    """CLI entry point."""

    parser = argparse.ArgumentParser(
        description="Permission Testing Utility"
    )

    parser.add_argument(
        "--url",
        required=True,
        help="Protected endpoint.",
    )

    parser.add_argument(
        "--admin-token",
        required=True,
        help="Administrator JWT/API token.",
    )

    parser.add_argument(
        "--user-token",
        required=True,
        help="Regular user JWT/API token.",
    )

    parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_TIMEOUT,
    )

    args = parser.parse_args()

    tester = PermissionTester(
        url=args.url,
        admin_token=args.admin_token,
        user_token=args.user_token,
        timeout=args.timeout,
    )

    try:
        results = tester.run()

        passed = 0

        logger.info("")
        logger.info("========== Permission Test Report ==========")

        for result in results:

            status = "PASS" if result.passed else "FAIL"

            if result.passed:
                passed += 1

            logger.info(
                "{} | {} | Expected: {} | Actual: {}",
                status,
                result.test_name,
                result.expected_status,
                result.actual_status,
            )

        logger.info("")
        logger.info(
            "Summary: {}/{} tests passed.",
            passed,
            len(results),
        )

        if passed != len(results):
            raise PermissionTestError(
                "One or more permission tests failed."
            )

        logger.success("Permission validation completed successfully.")

    except Exception as exc:
        logger.exception(exc)
        raise


if __name__ == "__main__":
    main()