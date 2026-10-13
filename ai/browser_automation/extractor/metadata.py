"""Extract metadata from a browser page."""

from typing import Any


async def extract_metadata(page: Any) -> dict[str, str]:
    if page is None:
        raise ValueError("A browser page is required.")

    title = await page.title()
    url = getattr(page, "url", "")

    description = await page.locator(
        'meta[name="description"]'
    ).get_attribute("content")

    canonical = await page.locator(
        'link[rel="canonical"]'
    ).get_attribute("href")

    return {
        "title": title.strip() if isinstance(title, str) else "",
        "url": url if isinstance(url, str) else "",
        "description": description.strip()
        if isinstance(description, str) else "",
        "canonical_url": canonical.strip()
        if isinstance(canonical, str) else "",
    }
