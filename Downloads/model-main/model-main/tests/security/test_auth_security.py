"""
security/test_auth_security.py

Test authentication and authorization security for an API.

Features:
- Valid token test
- Missing token test
- Invalid token test
- Optional custom authentication header

Usage:
    python security/test_auth_security.py

Examples:
    python security/test_auth_security.py --url http://localhost:8000/api/v1/users --token YOUR_TOKEN
    python security/test_auth_security.py --url http://localhost:8000/health --header X-API-Key --token YOUR_API_KEY

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
class AuthTestResult:
    """Authentication test result."""

    test_name: str
    status_code: int
    passed: bool


class AuthenticationSecurityError(Exception):
    """Raised when authentication security tests fail."""


class AuthenticationSecurityTester:
    """Run authentication security tests."""

    def __init__(
        self,
        url: str,
        token: str,
        header: str = "Authorization",
        timeout: int = DEFAULT_TIMEOUT,
    ) -> None:
        self.url = url
        self.token = token
        self.header = header
        self.timeout = timeout

    def _headers(self, token: str | None = None) -> dict[str, str]:
        """Build request headers."""

        if token is None:
            return {}

        if self.header.lower() == "authorization":
            return {
                "Authorization": f"Bearer {token}",
            }

        return {
            self.header: token,
        }

    def _request(self, token: str | None) -> requests.Response:
        """Send HTTP GET request."""

        return requests.get(
            self.url,
            headers=self._headers(token),
            timeout=self.timeout,
        )

    def valid_token_test(self) -> AuthTestResult:
        """Test valid authentication."""

        response = self._request(self.token)

        return AuthTestResult(
            test_name="Valid Token",
            status_code=response.status_code,
            passed=response.status_code < 400,
        )

    def missing_token_test(self) -> AuthTestResult:
        """Test endpoint without credentials."""

        response = self._request(None)

        return AuthTestResult(
            test_name="Missing Token",
            status_code=response.status_code,
            passed=response.status_code in (401, 403),
        )

    def invalid_token_test(self) -> AuthTestResult:
        """Test invalid credentials."""

        response = self._request("invalid-token")

        return AuthTestResult(
            test_name="Invalid Token",
            status_code=response.status_code,
            passed=response.status_code in (401, 403),
        )

    def run(self) -> list[AuthTestResult]:
        """Run all authentication tests."""

        logger.info("Running authentication security tests...")

        results = [
            self.valid_token_test(),
            self.missing_token_test(),
            self.invalid_token_test(),
        ]

        logger.success("Authentication security tests completed.")

        return results


def main() -> None:
    """CLI entry point."""

    parser = argparse.ArgumentParser(
        description="Authentication Security Test"
    )

    parser.add_argument(
        "--url",
        required=True,
        help="Protected API endpoint.",
    )

    parser.add_argument(
        "--token",
        required=True,
        help="Valid authentication token.",
    )

    parser.add_argument(
        "--header",
        default="Authorization",
        help="Authentication header.",
    )

    parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_TIMEOUT,
    )

    args = parser.parse_args()

    try:
        tester = AuthenticationSecurityTester(
            url=args.url,
            token=args.token,
            header=args.header,
            timeout=args.timeout,
        )

        results = tester.run()

        logger.info("")
        logger.info("========== Test Results ==========")

        passed = 0

        for result in results:
            status = "PASS" if result.passed else "FAIL"

            if result.passed:
                passed += 1

            logger.info(
                "{} | Status: {} | HTTP {}",
                status,
                result.test_name,
                result.status_code,
            )

        logger.info("")
        logger.info(
            "Passed: {}/{}",
            passed,
            len(results),
        )

        if passed != len(results):
            raise AuthenticationSecurityError(
                "One or more authentication tests failed."
            )

    except Exception as exc:
        logger.exception(exc)
        raise


if __name__ == "__main__":
    main()