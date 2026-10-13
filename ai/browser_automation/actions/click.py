from typing import Any

from ..constants import DEFAULT_TIMEOUT_MS
from ..exceptions import BrowserActionError
from .utils import action_result, require_selector


async def click_element(
    page: Any,
    selector: str,
    timeout_ms: int = DEFAULT_TIMEOUT_MS,
) -> dict[str, Any]:
    """Click a specific element on the current browser page."""
    selector = require_selector(selector, "Click")

    try:
        await page.locator(selector).click(timeout=timeout_ms)
        return action_result("click", selector=selector)
    except Exception as exc:
        raise BrowserActionError(f"Click action failed: {exc}") from exc
