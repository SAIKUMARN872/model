"""
security/test_api_keys.py

Validate one or more API keys by sending a request to a test endpoint.

Usage:
    python security/test_api_keys.py

Examples:
    python security/test_api_keys.py --url https://api.example.com/health --key YOUR_API_KEY
    python security/test_api_keys.py --url https://api.example.com/v1/models --env OPENAI_API_KEY

Requirements:
    pip install requests loguru
"""

from __future__ import annotations

import argparse
import os
from typing import Any

import requests
from loguru import logger


DEFAULT_TIMEOUT = 10


class APIKeyTestError(Exception):
    """Raised when API key validation fails."""


class APIKeyTester:
    """Validate an API key against an HTTP endpoint."""

    def __init__(
        self,
        url: str,
        api_key: str,
        header_name: str = "Authorization",
        timeout: int = DEFAULT_TIMEOUT,
    ) -> None:
        self.url = url
        self.api_key = api_key
        self.header_name = header_name
        self.timeout = timeout

    def _headers(self) -> dict[str, str]:
        """Build request headers."""

        if self.header_name.lower() == "authorization":
            return {
                "Authorization": f"Bearer {self.api_key}",
            }

        return {
            self.header_name: self.api_key,
        }

    def test(self) -> dict[str, Any]:
        """Test the API key."""

        logger.info("Testing API key against {}", self.url)

        response = requests.get(
            self.url,
            headers=self._headers(),
            timeout=self.timeout,
        )

        if response.status_code in (200, 201):
            logger.success("API key is valid.")

        elif response.status_code in (401, 403):
            raise APIKeyTestError(
                "API key is invalid or unauthorized."
            )

        else:
            logger.warning(
                "Received unexpected status code: {}",
                response.status_code,
            )

        try:
            return response.json()
        except ValueError:
            return {"response": response.text}


def test_api_key(
    url: str,
    api_key: str,
    header: str,
    timeout: int,
) -> None:
    """Execute the API key validation."""

    tester = APIKeyTester(
        url=url,
        api_key=api_key,
        header_name=header,
        timeout=timeout,
    )

    result = tester.test()

    logger.info("Response: {}", result)


def main() -> None:
    """CLI entry point."""

    parser = argparse.ArgumentParser(
        description="Test an API key."
    )

    parser.add_argument(
        "--url",
        required=True,
        help="Endpoint used to validate the API key.",
    )

    parser.add_argument(
        "--key",
        help="API key to test.",
    )

    parser.add_argument(
        "--env",
        help="Environment variable containing the API key.",
    )

    parser.add_argument(
        "--header",
        default="Authorization",
        help="HTTP header name for the API key.",
    )

    parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_TIMEOUT,
        help="Request timeout in seconds.",
    )

    args = parser.parse_args()

    api_key = args.key

    if not api_key and args.env:
        api_key = os.getenv(args.env)

    if not api_key:
        raise APIKeyTestError(
            "Provide an API key using --key or --env."
        )

    test_api_key(
        url=args.url,
        api_key=api_key,
        header=args.header,
        timeout=args.timeout,
    )


if __name__ == "__main__":
    main()