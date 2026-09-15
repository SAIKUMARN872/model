"""
Web crawler package.
"""

from .crawler import (
    CrawlConfig,
    CrawlPage,
    WebCrawler,
)

from .manager import (
    CrawlerManager,
)

from .queue import (
    CrawlItem,
    CrawlQueue,
)

from .utils import (
    extract_links,
    filter_links,
    get_domain,
    is_http_url,
    normalize_url,
    same_domain,
)


__all__ = [
    "CrawlConfig",
    "CrawlPage",
    "WebCrawler",
    "CrawlerManager",
    "CrawlItem",
    "CrawlQueue",
    "normalize_url",
    "get_domain",
    "same_domain",
    "is_http_url",
    "extract_links",
    "filter_links",
]


__version__ = "1.0.0"