"""
testing/performance_test.py

Basic performance/load testing utility for HTTP endpoints.

Usage:
    python testing/performance_test.py

Examples:
    python testing/performance_test.py --url http://localhost:8000/health
    python testing/performance_test.py --url http://localhost:8000/api/v1/chat --requests 500 --workers 25

Requirements:
    pip install requests loguru
"""

from __future__ import annotations

import argparse
import statistics
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass

import requests
from loguru import logger


@dataclass(slots=True)
class PerformanceResult:
    """Result of a performance test."""

    total_requests: int
    successful_requests: int
    failed_requests: int
    average_response_time: float
    minimum_response_time: float
    maximum_response_time: float
    requests_per_second: float


class PerformanceTestError(Exception):
    """Raised when performance testing fails."""


class PerformanceTester:
    """Execute a simple HTTP performance test."""

    def __init__(
        self,
        url: str,
        total_requests: int = 100,
        workers: int = 10,
        timeout: int = 10,
    ) -> None:
        self.url = url
        self.total_requests = total_requests
        self.workers = workers
        self.timeout = timeout

        self._lock = threading.Lock()
        self._times: list[float] = []
        self._success = 0
        self._failure = 0

    def _request(self) -> None:
        """Execute a single HTTP request."""

        start = time.perf_counter()

        try:
            response = requests.get(
                self.url,
                timeout=self.timeout,
            )

            elapsed = time.perf_counter() - start

            with self._lock:
                self._times.append(elapsed)

                if response.ok:
                    self._success += 1
                else:
                    self._failure += 1

        except requests.RequestException:
            elapsed = time.perf_counter() - start

            with self._lock:
                self._times.append(elapsed)
                self._failure += 1

    def run(self) -> PerformanceResult:
        """Run the performance test."""

        logger.info(
            "Starting performance test ({} requests, {} workers)",
            self.total_requests,
            self.workers,
        )

        overall_start = time.perf_counter()

        with ThreadPoolExecutor(max_workers=self.workers) as executor:
            futures = [
                executor.submit(self._request)
                for _ in range(self.total_requests)
            ]

            for future in as_completed(futures):
                future.result()

        duration = time.perf_counter() - overall_start

        result = PerformanceResult(
            total_requests=self.total_requests,
            successful_requests=self._success,
            failed_requests=self._failure,
            average_response_time=statistics.mean(self._times),
            minimum_response_time=min(self._times),
            maximum_response_time=max(self._times),
            requests_per_second=self.total_requests / duration,
        )

        logger.success("Performance test completed.")

        return result


def performance_test(
    url: str,
    requests_count: int,
    workers: int,
) -> None:
    """Run the performance test."""

    tester = PerformanceTester(
        url=url,
        total_requests=requests_count,
        workers=workers,
    )

    result = tester.run()

    logger.info("========== Performance Report ==========")
    logger.info("URL                  : {}", url)
    logger.info("Total Requests       : {}", result.total_requests)
    logger.info("Successful Requests  : {}", result.successful_requests)
    logger.info("Failed Requests      : {}", result.failed_requests)
    logger.info(
        "Average Response     : {:.3f} sec",
        result.average_response_time,
    )
    logger.info(
        "Minimum Response     : {:.3f} sec",
        result.minimum_response_time,
    )
    logger.info(
        "Maximum Response     : {:.3f} sec",
        result.maximum_response_time,
    )
    logger.info(
        "Requests / Second    : {:.2f}",
        result.requests_per_second,
    )


def main() -> None:
    """CLI entry point."""

    parser = argparse.ArgumentParser(
        description="HTTP Performance Test"
    )

    parser.add_argument(
        "--url",
        default="http://localhost:8000/health",
        help="Target endpoint.",
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
        default=10,
        help="Concurrent worker threads.",
    )

    args = parser.parse_args()

    try:
        performance_test(
            url=args.url,
            requests_count=args.requests,
            workers=args.workers,
        )

    except Exception as exc:
        logger.exception("Performance test failed.")
        raise PerformanceTestError(str(exc)) from exc


if __name__ == "__main__":
    main()