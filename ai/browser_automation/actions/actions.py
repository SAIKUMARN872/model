from typing import Any

from ..constants import BrowserActionType, DEFAULT_TIMEOUT_MS
from ..exceptions import BrowserActionError
from ..models import BrowserAction
from .click import click_element
from .forms import fill_field
from .utils import action_result


async def perform_action(
    page: Any,
    action: BrowserAction,
    timeout_ms: int = DEFAULT_TIMEOUT_MS,
) -> dict[str, Any]:
    """Execute one supported browser action on a Playwright page."""
    if not isinstance(action, BrowserAction):
        raise TypeError("action must be a BrowserAction instance.")

    kind = action.action_type

    try:
        if kind == BrowserActionType.NAVIGATE:
            from ..schemas import validate_url

            url = validate_url(action.url or "")
            await page.goto(
                url,
                timeout=timeout_ms,
                wait_until="domcontentloaded",
            )
            return action_result("navigate", url=url)

        if kind == BrowserActionType.INSPECT:
            title = await page.title()
            url = page.url
            if callable(url):
                url = await url()
            return action_result("inspect", title=title, url=url)

        if kind == BrowserActionType.CLICK:
            return await click_element(
                page, action.selector or "", timeout_ms
            )

        if kind == BrowserActionType.FILL:
            if action.value is None:
                raise BrowserActionError("Fill action requires a value.")
            return await fill_field(
                page, action.selector or "", action.value, timeout_ms
            )

        if kind == BrowserActionType.SCREENSHOT:
            if not action.value or not action.value.strip():
                raise BrowserActionError(
                    "Screenshot action requires a destination path."
                )
            from pathlib import Path

            destination = Path(action.value).expanduser().resolve()
            destination.parent.mkdir(parents=True, exist_ok=True)
            await page.screenshot(path=str(destination))
            return action_result(
                "screenshot", screenshot_path=str(destination)
            )

        raise BrowserActionError(f"Unsupported browser action: {kind}")

    except BrowserActionError:
        raise
    except Exception as exc:
        raise BrowserActionError(
            f"{getattr(kind, 'value', kind)} action failed: {exc}"
        ) from exc
