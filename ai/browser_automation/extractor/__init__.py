"""Browser page extraction API."""

from .content import extract_content
from .extractor import PageExtractor
from .metadata import extract_metadata
from .utils import normalize_text

__all__ = [
    "PageExtractor",
    "extract_content",
    "extract_metadata",
    "normalize_text",
]
