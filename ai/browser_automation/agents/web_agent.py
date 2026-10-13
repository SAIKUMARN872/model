from typing import Any

from ..actions import perform_action
from ..constants import BrowserActionType
from ..models import BrowserAction
from .utils import extract_links, extract_page_text


class WebAgent:
    """Perform basic website navigation and page inspection."""

    def __init__(self, page: Any):
        if page is None:
            raise ValueError("A Playwright page is required.")
        self.page = page

    async def open(self, url: str) -> dict[str, Any]:
        """Open a validated HTTP(S) URL."""
        navigation = await perform_action(
            self.page,
            BrowserAction(
                action_type=BrowserActionType.NAVIGATE,
                url=url,
            ),
        )
        inspection = await perform_action(
            self.page,
            BrowserAction(action_type=BrowserActionType.INSPECT),
        )

        return {
            **navigation,
            "title": inspection.get("title", ""),
            "url": inspection.get("url", ""),
        }

    async def inspect(self) -> dict[str, Any]:
        """Collect basic information about the current page."""
        metadata = await perform_action(
            self.page,
            BrowserAction(action_type=BrowserActionType.INSPECT),
        )
        content = await extract_page_text(self.page)
        links = await extract_links(self.page)

        return {
            "title": metadata.get("title", ""),
            "url": metadata.get("url", ""),
            "content": content,
            "links": links,
        }
