"""
security/test_rate_limit.py

Test API rate limiting by sending multiple requests to an endpoint.

Features:
- Verifies rate limiting is enforced
- Reports successful and rate-limited requests
- Measures total execution time

Usage:
    python security/test_rate_limit.py

Examples:
    python security/test_rate_limit.py \
        --url http://localhost:8000/api/v1/chat \
        --requests 100

Requirements:
    pip install requests loguru
"""

from __future__ import annotations

import argparse
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass

import requests
from loguru import logger


DEFAULT_TIMEOUT = 10


@dataclass(slots=True)
class RateLimitResult:
    """Rate limit test results."""

    total_requests: int
    successful_requests: int
    rate_limited_requests: int
    failed_requests: int
    duration_seconds: float


class RateLimitTestError(Exception):
    """Raised when the rate limit test fails."""


class RateLimitTester:
    """Perform API rate limit testing."""

    def __init__(
        self,
        url: str,
        requests_count: int,
        workers: int,
        timeout: int = DEFAULT_TIMEOUT,
    ) -> None:
        self.url = url
        self.requests_count = requests_count
        self.workers = workers
        self.timeout = timeout

    def _request(self) -> int:
        """Send a single HTTP request."""

        try:
            response = requests.get(
                self.url,
                timeout=self.timeout,
            )

            return response.status_code

        except requests.RequestException:
            return 0

    def run(self) -> RateLimitResult:
        """Execute the rate limit test."""

        logger.info(
            "Sending {} requests using {} workers...",
            self.requests_count,
            self.workers,
        )

        success = 0
        limited = 0
        failed = 0

        start = time.perf_counter()

        with ThreadPoolExecutor(max_workers=self.workers) as executor:

            futures = [
                executor.submit(self._request)
                for _ in range(self.requests_count)
            ]

            for future in as_completed(futures):

                status = future.result()

                if status in (200, 201):
                    success += 1

                elif status == 429:
                    limited += 1

                else:
                    failed += 1

        duration = time.perf_counter() - start

        return RateLimitResult(
            total_requests=self.requests_count,
            successful_requests=success,
            rate_limited_requests=limited,
            failed_requests=failed,
            duration_seconds=duration,
        )


def main() -> None:
    """CLI entry point."""

    parser = argparse.ArgumentParser(
        description="API Rate Limit Test"
    )

    parser.add_argument(
        "--url",
        required=True,
        help="API endpoint to test.",
    )

    parser.add_argument(
        "--requests",
        type=int,
        default=100,
        help="Total number of requests.",
    )

    parser.add_argument(
        "--workers",
        type=int,
        default=20,
        help="Concurrent workers.",
    )

    parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_TIMEOUT,
    )

    args = parser.parse_args()

    try:
        tester = RateLimitTester(
            url=args.url,
            requests_count=args.requests,
            workers=args.workers,
            timeout=args.timeout,
        )

        result = tester.run()

        logger.info("")
        logger.info("========== Rate Limit Report ==========")
        logger.info("Total Requests      : {}", result.total_requests)
        logger.info("Successful          : {}", result.successful_requests)
        logger.info("Rate Limited (429)  : {}", result.rate_limited_requests)
        logger.info("Failed              : {}", result.failed_requests)
        logger.info("Duration            : {:.2f} sec", result.duration_seconds)

        if result.rate_limited_requests > 0:
            logger.success("Rate limiting is enforced.")
        else:
            logger.warning(
                "No HTTP 429 responses detected. Verify rate limiting configuration."
            )

    except Exception as exc:
        logger.exception(exc)
        raise RateLimitTestError(
            "Rate limit test failed."
        ) from exc


if __name__ == "__main__":
    main()