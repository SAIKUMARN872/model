from __future__ import annotations

from pathlib import Path
from statistics import mean
from typing import Any

from ..exceptions import ComputerActionError


class TesseractOCRBackend:
    """Optional Tesseract OCR adapter for screen analysis and text detection.

    Pass an engine implementing image_to_data(image, output_type=...)
    to test or customize OCR without installing optional dependencies.
    """

    def __init__(
        self,
        engine: Any = None,
        *,
        min_confidence: float = 0.0,
    ) -> None:
        if (
            isinstance(min_confidence, bool)
            or not isinstance(min_confidence, (int, float))
            or not 0.0 <= min_confidence <= 1.0
        ):
            raise ValueError("min_confidence must be between 0 and 1.")

        self._engine = engine
        self._injected_engine = engine is not None
        self._min_confidence = float(min_confidence)

    def _get_engine(self) -> Any:
        if self._engine is None:
            try:
                import pytesseract
            except ImportError as exc:
                raise ComputerActionError(
                    "OCR requires the optional 'pytesseract' package "
                    "and the Tesseract OCR executable."
                ) from exc
            self._engine = pytesseract
        return self._engine

    @staticmethod
    def _resolve_image(screenshot: Any) -> Any:
        if screenshot is None:
            raise ValueError("screenshot must not be None.")

        if isinstance(screenshot, (str, Path)):
            return str(screenshot)

        path = getattr(screenshot, "path", None)
        if path:
            return str(path)

        image = getattr(screenshot, "image", None)
        if image is not None:
            return image

        return screenshot

    def _read_data(self, screenshot: Any) -> dict[str, Any]:
        image = self._resolve_image(screenshot)
        engine = self._get_engine()
        output_type = getattr(
            getattr(engine, "Output", None), "DICT", "dict"
        )

        try:
            if isinstance(image, str) and not self._injected_engine:
                try:
                    from PIL import Image
                except ImportError as exc:
                    raise ComputerActionError(
                        "Reading screenshot files requires the optional "
                        "'Pillow' package."
                    ) from exc

                with Image.open(image) as opened:
                    data = engine.image_to_data(
                        opened, output_type=output_type
                    )
            else:
                data = engine.image_to_data(
                    image, output_type=output_type
                )
        except ComputerActionError:
            raise
        except Exception as exc:
            raise ComputerActionError(
                "Tesseract OCR failed. Check the screenshot and "
                "Tesseract executable installation."
            ) from exc

        if not isinstance(data, dict):
            raise ComputerActionError("OCR engine must return a dictionary.")

        required = ("text", "conf", "left", "top", "width", "height")
        for key in required:
            if key not in data or not isinstance(data[key], (list, tuple)):
                raise ComputerActionError(
                    f"OCR result field '{key}' must be a list."
                )

        lengths = {len(data[key]) for key in required}
        if len(lengths) != 1:
            raise ComputerActionError(
                "OCR result fields have inconsistent lengths."
            )

        return data

    def _extract(self, screenshot: Any) -> list[dict[str, Any]]:
        data = self._read_data(screenshot)
        words: list[dict[str, Any]] = []

        for index, raw_text in enumerate(data["text"]):
            if not isinstance(raw_text, str):
                raise ComputerActionError("OCR text entries must be strings.")

            text = " ".join(raw_text.split())
            if not text:
                continue

            try:
                raw_confidence = float(data["conf"][index])
                x = int(data["left"][index])
                y = int(data["top"][index])
                width = int(data["width"][index])
                height = int(data["height"][index])
            except (TypeError, ValueError, OverflowError) as exc:
                raise ComputerActionError(
                    "OCR returned invalid confidence or coordinates."
                ) from exc

            if not 0.0 <= raw_confidence <= 100.0:
                continue

            confidence = raw_confidence / 100.0
            if confidence < self._min_confidence:
                continue

            if x < 0 or y < 0 or width <= 0 or height <= 0:
                continue

            words.append(
                {
                    "element_id": f"ocr-text-{index}",
                    "element_type": "text",
                    "label": text,
                    "bounds": {
                        "x": x,
                        "y": y,
                        "width": width,
                        "height": height,
                    },
                    "confidence": confidence,
                    "interactable": False,
                    "metadata": {"source": "tesseract_ocr"},
                }
            )

        return words

    def analyze(self, screenshot: Any) -> dict[str, Any]:
        """Return the observation format expected by ScreenAnalyzer."""
        words = self._extract(screenshot)
        texts = [word["label"] for word in words]

        return {
            "summary": " ".join(texts),
            "visible_text": texts,
            "confidence": (
                mean(word["confidence"] for word in words)
                if words else 0.0
            ),
            "source": "tesseract_ocr",
        }

    def detect(self, screenshot: Any) -> list[dict[str, Any]]:
        """Return OCR text regions in the existing UI element format."""
        return self._extract(screenshot)

