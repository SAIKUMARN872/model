from typing import Any

from ..actions import perform_action
from ..constants import BrowserActionType
from ..models import BrowserAction
from .utils import extract_page_text, normalize_text


class ResearchAgent:
    """Collect readable page content for a browser-based research task."""

    def __init__(self, page: Any):
        if page is None:
            raise ValueError("A Playwright page is required.")
        self.page = page

    async def inspect_current_page(self) -> dict[str, Any]:
        """Return the current page title, URL, and visible body text."""
        metadata = await perform_action(
            self.page,
            BrowserAction(action_type=BrowserActionType.INSPECT),
        )
        content = await extract_page_text(self.page)

        return {
            "title": metadata.get("title", ""),
            "url": metadata.get("url", ""),
            "content": content,
            "normalized_content": normalize_text(content),
        }

    async def research_url(self, url: str) -> dict[str, Any]:
        """Navigate to a URL and collect its page content."""
        await perform_action(
            self.page,
            BrowserAction(
                action_type=BrowserActionType.NAVIGATE,
                url=url,
            ),
        )
        return await self.inspect_current_page()
