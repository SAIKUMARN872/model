"""Normalize extracted page data into a stable result structure."""

from .extractor import extract_html
from .utils import normalize_text


def parse_html(html, base_url=""):
    """Parse HTML into normalized, application-friendly page data."""
    extracted = extract_html(html, base_url=base_url)

    return {
        "url": base_url,
        "title": normalize_text(extracted["title"]),
        "description": normalize_text(
            extracted["metadata"].get("description", "")
        ),
        "metadata": extracted["metadata"],
        "headings": extracted["headings"],
        "links": extracted["links"],
        "text": extracted["text"],
        "word_count": len(extracted["text"].split()),
    }
