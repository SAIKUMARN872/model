"""
Web extraction package.
"""

from .content import (
    ContentExtractor,
)

from .extractor import (
    ExtractedPage,
    PageExtractor,
)

from .metadata import (
    MetadataExtractor,
)

from .utils import (
    absolute_url,
    character_count,
    clean_text,
    extract_words,
    normalize_whitespace,
    truncate,
    unique_preserve_order,
    word_count,
)


__all__ = [
    "ContentExtractor",
    "MetadataExtractor",
    "PageExtractor",
    "ExtractedPage",
    "clean_text",
    "normalize_whitespace",
    "absolute_url",
    "extract_words",
    "word_count",
    "character_count",
    "truncate",
    "unique_preserve_order",
]


__version__ = "1.0.0"