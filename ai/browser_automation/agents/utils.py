import re
from typing import Any


def normalize_text(value: str | None) -> str:
    """Collapse repeated whitespace into single spaces."""
    if not isinstance(value, str):
        return ""
    return re.sub(r"\s+", " ", value).strip()


async def extract_page_text(page: Any) -> str:
    """Extract readable text from the page body."""
    try:
        body = page.locator("body")
        text = await body.inner_text()
        return normalize_text(text)
    except Exception:
        return ""


async def extract_links(page: Any, limit: int = 100) -> list[dict[str, str]]:
    """Extract visible link labels and resolved destinations."""
    if not isinstance(limit, int) or isinstance(limit, bool) or limit < 1:
        raise ValueError("limit must be a positive integer.")

    try:
        anchors = page.locator("a")
        count = min(await anchors.count(), limit)
        results: list[dict[str, str]] = []

        for index in range(count):
            anchor = anchors.nth(index)
            try:
                href = await anchor.get_attribute("href")
                label = normalize_text(await anchor.inner_text())

                if not href:
                    continue

                resolved = await anchor.evaluate(
                    "(element) => element.href"
                )
                results.append({
                    "text": label,
                    "url": resolved or href,
                })
            except Exception:
                continue

        return results
    except Exception:
        return []
