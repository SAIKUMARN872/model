"""
Text normalization package for ModelNow embeddings.
"""

from .cleaner import (
    CleanerConfig,
    TextCleaner,
)

from .normalizer import (
    NormalizerConfig,
    TextNormalizer,
)

from .preprocessor import (
    EmbeddingPreprocessor,
    PreprocessingResult,
)

from .utils import (
    collapse_newlines,
    collapse_spaces,
    normalize_for_embedding,
    normalize_line_endings,
    normalize_many,
    normalize_whitespace,
    remove_control_characters,
    strip_html,
    text_statistics,
    truncate_text,
    unicode_normalize,
    validate_text,
    validate_texts,
)


__all__ = [
    "CleanerConfig",
    "TextCleaner",
    "NormalizerConfig",
    "TextNormalizer",
    "EmbeddingPreprocessor",
    "PreprocessingResult",
    "validate_text",
    "validate_texts",
    "unicode_normalize",
    "normalize_line_endings",
    "collapse_spaces",
    "collapse_newlines",
    "normalize_whitespace",
    "remove_control_characters",
    "strip_html",
    "normalize_for_embedding",
    "normalize_many",
    "truncate_text",
    "text_statistics",
]


__version__ = "1.0.0"