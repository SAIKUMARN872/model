"""
security/rotate_keys.py

Utility for rotating application secrets such as API keys,
JWT secrets, or encryption keys.

Usage:
    python security/rotate_keys.py

Example:
    python security/rotate_keys.py --length 64
"""

from __future__ import annotations

import argparse
import secrets
import string
from pathlib import Path

from loguru import logger


PROJECT_ROOT = Path(__file__).resolve().parent.parent
KEYS_DIR = PROJECT_ROOT / "security" / "keys"


class KeyRotationError(Exception):
    """Raised when key rotation fails."""


class KeyRotator:
    """Generate and store new secret keys."""

    def __init__(
        self,
        output_dir: Path,
        key_length: int = 64,
    ) -> None:
        self.output_dir = output_dir
        self.key_length = key_length

    def generate_key(self) -> str:
        """Generate a cryptographically secure random key."""

        alphabet = (
            string.ascii_letters
            + string.digits
            + string.punctuation
        )

        return "".join(
            secrets.choice(alphabet)
            for _ in range(self.key_length)
        )

    def rotate(self) -> Path:
        """Generate and save a new key."""

        self.output_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        key = self.generate_key()

        key_file = self.output_dir / "secret.key"

        key_file.write_text(
            key,
            encoding="utf-8",
        )

        logger.success(
            "New secret key generated: {}",
            key_file,
        )

        return key_file


def rotate_keys(length: int = 64) -> None:
    """Rotate application secret keys."""

    try:
        rotator = KeyRotator(
            output_dir=KEYS_DIR,
            key_length=length,
        )

        rotator.rotate()

    except Exception as exc:
        logger.exception("Key rotation failed.")
        raise KeyRotationError(
            "Unable to rotate secret keys."
        ) from exc


def main() -> None:
    """CLI entry point."""

    parser = argparse.ArgumentParser(
        description="Rotate application secret keys."
    )

    parser.add_argument(
        "--length",
        type=int,
        default=64,
        help="Length of the generated secret key.",
    )

    args = parser.parse_args()

    rotate_keys(args.length)


if __name__ == "__main__":
    main()