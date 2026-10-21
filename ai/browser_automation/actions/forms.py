from typing import Any

from ..constants import DEFAULT_TIMEOUT_MS
from ..exceptions import BrowserActionError
from .utils import action_result, require_selector


async def fill_field(
    page: Any,
    selector: str,
    value: str,
    timeout_ms: int = DEFAULT_TIMEOUT_MS,
) -> dict[str, Any]:
    """Fill a form field without exposing its value in the result."""
    selector = require_selector(selector, "Fill")

    if not isinstance(value, str):
        raise ValueError("Fill value must be a string.")

    try:
        await page.locator(selector).fill(value, timeout=timeout_ms)
        return action_result(
            "fill",
            selector=selector,
            filled=True,
        )
    except Exception as exc:
        raise BrowserActionError(
            f"Fill action failed: {exc}"
        ) from exc
