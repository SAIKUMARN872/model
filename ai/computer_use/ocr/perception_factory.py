from __future__ import annotations

from pathlib import Path
from typing import Any

from ..visual_interface.perception import VisualPerception
from .tesseract_backend import TesseractOCRBackend


def create_tesseract_perception(
    *,
    min_confidence: float = 0.0,
    tesseract_cmd: str | Path | None = None,
) -> VisualPerception:
    """Create screen perception backed by the real Tesseract OCR engine."""
    if tesseract_cmd is not None:
        executable = Path(tesseract_cmd)
        if not executable.is_file():
            raise FileNotFoundError(
                f"Tesseract executable was not found: {executable}"
            )

        try:
            import pytesseract
        except ImportError as exc:
            raise RuntimeError(
                "Install pytesseract and Pillow to enable OCR."
            ) from exc

        pytesseract.pytesseract.tesseract_cmd = str(executable)

    backend = TesseractOCRBackend(min_confidence=min_confidence)

    return VisualPerception(
        analyzer=backend,
        detector=backend,
    )
