from __future__ import annotations

from dataclasses import dataclass

from .cleaner import clean_text


@dataclass(frozen=True, slots=True)
class PreprocessingConfig:
    lowercase: bool = False
    unicode_normalization: str = "NFC"
    collapse_whitespace: bool = True
    strip_control_characters: bool = True
    strip_edges: bool = True
    min_characters: int = 1
    max_characters: int | None = None


class TextPreprocessor:
    def __init__(self, config: PreprocessingConfig | None = None) -> None:
        if config is not None and not isinstance(config, PreprocessingConfig):
            raise TypeError("config must be a PreprocessingConfig or None")

        self.config = config if config is not None else PreprocessingConfig()
        self._validate_config()

    def _validate_config(self) -> None:
        config = self.config

        if not isinstance(config.lowercase, bool):
            raise TypeError("lowercase must be a boolean")

        if not isinstance(config.collapse_whitespace, bool):
            raise TypeError("collapse_whitespace must be a boolean")

        if not isinstance(config.strip_control_characters, bool):
            raise TypeError("strip_control_characters must be a boolean")

        if not isinstance(config.strip_edges, bool):
            raise TypeError("strip_edges must be a boolean")

        if (
            isinstance(config.min_characters, bool)
            or not isinstance(config.min_characters, int)
            or config.min_characters < 0
        ):
            raise ValueError("min_characters must be a non-negative integer")

        if config.max_characters is not None:
            if (
                isinstance(config.max_characters, bool)
                or not isinstance(config.max_characters, int)
                or config.max_characters < 1
            ):
                raise ValueError("max_characters must be a positive integer or None")

            if config.max_characters < config.min_characters:
                raise ValueError("max_characters cannot be less than min_characters")

    def process(self, text: str) -> str:
        result = clean_text(
            text,
            unicode_normalization=self.config.unicode_normalization,
            strip_control_characters=self.config.strip_control_characters,
            collapse_whitespace=self.config.collapse_whitespace,
            strip_edges=self.config.strip_edges,
        )

        if self.config.lowercase:
            result = result.lower()

        if len(result) < self.config.min_characters:
            raise ValueError("processed text is shorter than min_characters")

        if (
            self.config.max_characters is not None
            and len(result) > self.config.max_characters
        ):
            result = result[: self.config.max_characters]

        return result

    def process_many(self, texts: list[str] | tuple[str, ...]) -> list[str]:
        if isinstance(texts, (str, bytes)) or not isinstance(texts, (list, tuple)):
            raise TypeError("texts must be a list or tuple of strings")

        return [self.process(text) for text in texts]
