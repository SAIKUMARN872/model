"""
testing/run_tests.py

Run the project's automated test suite using pytest.

Usage:
    python testing/run_tests.py

Examples:
    python testing/run_tests.py
    python testing/run_tests.py --tests tests
    python testing/run_tests.py --verbose

Requirements:
    pip install pytest loguru
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from loguru import logger


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_TEST_DIR = PROJECT_ROOT / "tests"


class TestExecutionError(Exception):
    """Raised when test execution fails."""


class TestRunner:
    """Run the project's test suite."""

    def __init__(
        self,
        test_path: Path,
        verbose: bool = False,
    ) -> None:
        self.test_path = test_path
        self.verbose = verbose

    def run(self) -> None:
        """Execute pytest."""

        if not self.test_path.exists():
            raise TestExecutionError(
                f"Test directory not found: {self.test_path}"
            )

        command = [
            sys.executable,
            "-m",
            "pytest",
            str(self.test_path),
        ]

        if self.verbose:
            command.append("-v")

        logger.info("Running tests...")

        subprocess.run(
            command,
            check=True,
        )

        logger.success("All tests completed successfully.")


def run_tests(
    test_path: Path,
    verbose: bool = False,
) -> None:
    """Run the test suite."""

    try:
        runner = TestRunner(
            test_path=test_path,
            verbose=verbose,
        )

        runner.run()

    except subprocess.CalledProcessError as exc:
        logger.exception("Test execution failed.")
        raise TestExecutionError(
            "One or more tests failed."
        ) from exc


def main() -> None:
    """CLI entry point."""

    parser = argparse.ArgumentParser(
        description="Run project tests."
    )

    parser.add_argument(
        "--tests",
        default=str(DEFAULT_TEST_DIR),
        help="Path to the test directory or test file.",
    )

    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose pytest output.",
    )

    args = parser.parse_args()

    run_tests(
        test_path=Path(args.tests),
        verbose=args.verbose,
    )


if __name__ == "__main__":
    main()