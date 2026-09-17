"""
Web scraping package.
"""

from .extractor import (
    PageExtractor,
    ScrapedContent,
)

from .parser import (
    HTMLDocumentParser,
    ParsedHTML,
)

from .scraper import (
    ScraperConfig,
    WebScraper,
)

from .utils import (
    absolute_url,
    clean_text,
    get_domain,
    is_valid_url,
    normalize_url,
    same_domain,
    unique_items,
)


__all__ = [
    "PageExtractor",
    "ScrapedContent",
    "HTMLDocumentParser",
    "ParsedHTML",
    "ScraperConfig",
    "WebScraper",
    "normalize_url",
    "get_domain",
    "same_domain",
    "is_valid_url",
    "absolute_url",
    "clean_text",
    "unique_items",
]


__version__ = "1.0.0"