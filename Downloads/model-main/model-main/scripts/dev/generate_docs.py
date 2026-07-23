"""
dev/generate_docs.py

Generate project documentation using Sphinx.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from loguru import logger


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = PROJECT_ROOT / "docs"


class DocumentationGenerationError(Exception):
    """Raised when documentation generation fails."""


class DocumentationGenerator:
    """Generate project documentation."""

    def __init__(self, docs_dir: Path) -> None:
        self.docs_dir = docs_dir

    def validate(self) -> None:
        """Validate the documentation directory."""

        if not self.docs_dir.exists():
            raise DocumentationGenerationError(
                f"Documentation directory not found: {self.docs_dir}"
            )

        if not (self.docs_dir / "conf.py").exists():
            raise DocumentationGenerationError(
                "Sphinx configuration (conf.py) not found."
            )

    def generate(self) -> None:
        """Generate HTML documentation."""

        self.validate()

        build_dir = self.docs_dir / "_build"

        logger.info("Generating project documentation...")

        subprocess.run(
            [
                sys.executable,
                "-m",
                "sphinx",
                "-b",
                "html",
                str(self.docs_dir),
                str(build_dir),
            ],
            check=True,
        )

        logger.success(
            "Documentation generated successfully: {}",
            build_dir,
        )


def generate_docs() -> None:
    """Generate project documentation."""

    try:
        DocumentationGenerator(DOCS_DIR).generate()

    except subprocess.CalledProcessError as exc:
        logger.exception("Documentation generation failed.")
        raise DocumentationGenerationError(
            "Unable to generate documentation."
        ) from exc


if __name__ == "__main__":
    generate_docs()