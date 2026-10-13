from typing import Any, Iterable

from ..actions import perform_action
from ..exceptions import BrowserActionError
from ..models import BrowserAction


class BrowserAgent:
    """Execute browser actions sequentially on an existing Playwright page."""

    def __init__(self, page: Any):
        if page is None:
            raise ValueError("A Playwright page is required.")
        self.page = page

    async def execute(self, action: BrowserAction) -> dict[str, Any]:
        """Execute one browser action."""
        return await perform_action(self.page, action)

    async def execute_many(
        self,
        actions: Iterable[BrowserAction],
    ) -> list[dict[str, Any]]:
        """Execute actions in order and stop if an action fails."""
        results: list[dict[str, Any]] = []

        for index, action in enumerate(actions):
            try:
                result = await self.execute(action)
                results.append(result)
            except Exception as exc:
                raise BrowserActionError(
                    f"Browser action {index + 1} failed: {exc}"
                ) from exc

        return results
