"""Extract readable text and links from a browser page."""

from typing import Any
from urllib.parse import urljoin, urlsplit


async def extract_content(page: Any, *, max_links: int = 100) -> dict:
    if page is None:
        raise ValueError("A browser page is required.")

    if isinstance(max_links, bool) or not isinstance(max_links, int) or max_links < 0:
        raise ValueError("max_links must be a non-negative integer.")

    text = await page.locator("body").inner_text()
    current_url = getattr(page, "url", "")

    if not isinstance(text, str):
        raise ValueError("Page text must be a string.")

    raw_links = await page.locator("a[href]").evaluate_all(
        """elements => elements.map(element => ({
            text: (element.innerText || element.textContent || "").trim(),
            href: element.href || element.getAttribute("href") || ""
        }))"""
    )

    links = []
    seen = set()

    for item in raw_links:
        if not isinstance(item, dict):
            continue

        href = item.get("href")
        label = item.get("text", "")

        if not isinstance(href, str) or not href.strip():
            continue

        absolute_url = urljoin(current_url, href.strip())
        parsed = urlsplit(absolute_url)

        if parsed.scheme not in {"http", "https"} or not parsed.hostname:
            continue

        if absolute_url in seen:
            continue

        seen.add(absolute_url)
        links.append({
            "text": label.strip() if isinstance(label, str) else "",
            "url": absolute_url,
        })

        if len(links) >= max_links:
            break

    return {"text": text, "links": links}
