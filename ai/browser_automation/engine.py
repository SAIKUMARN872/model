import inspect
from pathlib import Path
from typing import Any, Callable

from .constants import BrowserActionType, BrowserTaskStatus, DEFAULT_TIMEOUT_MS
from .exceptions import (
    ApprovalRequiredError,
    BrowserActionError,
    BrowserUnavailableError,
)
from .models import BrowserAction, BrowserExecutionResult, BrowserTask
from .schemas import action_requires_approval, validate_task, validate_url
from .security.sandbox import validate_sandbox_destination
from .utils import new_task_id, timestamp
from .verification.verification import verify_page, VerificationStatus


class BrowserAutomationEngine:
    """Execute validated browser tasks against a page or a Playwright browser."""

    def __init__(
        self,
        page: Any | None = None,
        approval_callback: Callable[..., Any] | None = None,
        timeout_ms: int = DEFAULT_TIMEOUT_MS,
        headless: bool = True,
    ) -> None:
        self.page = page
        self.approval_callback = approval_callback
        self.timeout_ms = timeout_ms
        self.headless = headless

    async def _install_navigation_guard(self, page: Any):
        route_method = getattr(page, "route", None)
        if not callable(route_method):
            return None

        async def guard(route):
            try:
                validate_sandbox_destination(route.request.url)
            except Exception:
                await route.abort("blockedbyclient")
                return
            await route.continue_()

        await route_method("**/*", guard)
        return guard

    async def _validate_current_url(self, page: Any) -> str:
        current_url = page.url
        if callable(current_url):
            current_url = await current_url()
        return validate_sandbox_destination(str(current_url))

    async def _approved(self, task: BrowserTask, action: BrowserAction) -> bool:
        if self.approval_callback is None:
            return False

        description = action.description or (
            f"Approve browser action: {action.action_type.value}"
        )
        answer = self.approval_callback(task.task_id, description)
        if inspect.isawaitable(answer):
            answer = await answer
        return answer is True

    async def _perform(self, page: Any, action: BrowserAction) -> dict[str, Any]:
        kind = action.action_type

        try:
            if kind == BrowserActionType.NAVIGATE:
                url = validate_url(action.url or "")
                await page.goto(
                    url,
                    timeout=self.timeout_ms,
                    wait_until="domcontentloaded",
                )
                final_url = await self._validate_current_url(page)
                return {
                    "action": kind.value,
                    "url": url,
                    "final_url": final_url,
                }

            if kind == BrowserActionType.INSPECT:
                title = await page.title()
                current_url = page.url
                if callable(current_url):
                    current_url = await current_url()
                return {"action": kind.value, "title": title, "url": current_url}

            if kind == BrowserActionType.CLICK:
                await page.locator(action.selector).click(timeout=self.timeout_ms)
                return {"action": kind.value, "selector": action.selector}

            if kind == BrowserActionType.FILL:
                await page.locator(action.selector).fill(
                    action.value, timeout=self.timeout_ms
                )
                return {"action": kind.value, "selector": action.selector, "filled": True}

            if kind == BrowserActionType.SCREENSHOT:
                if not action.value:
                    raise BrowserActionError(
                        "Screenshot action requires a destination path in value."
                    )
                destination = Path(action.value).expanduser().resolve()
                destination.parent.mkdir(parents=True, exist_ok=True)
                await page.screenshot(path=str(destination))
                return {"action": kind.value, "screenshot_path": str(destination)}

            raise BrowserActionError(f"Unsupported action: {kind}")
        except BrowserActionError:
            raise
        except Exception as exc:
            raise BrowserActionError(
                f"{kind.value} action failed: {exc}"
            ) from exc

    async def execute(self, task: BrowserTask) -> BrowserExecutionResult:
        if not task.task_id:
            task.task_id = new_task_id()

        validate_task(task)

        result = BrowserExecutionResult(
            task_id=task.task_id,
            status=BrowserTaskStatus.PENDING,
            goal=task.goal,
        )

        playwright_manager = None
        browser = None
        owned_page = self.page
        navigation_guard = None

        try:
            if owned_page is None:
                try:
                    from playwright.async_api import async_playwright
                except ImportError as exc:
                    raise BrowserUnavailableError(
                        "Playwright is not installed. Install it with "
                        "'python -m pip install playwright' and "
                        "'python -m playwright install chromium'."
                    ) from exc

                playwright_manager = async_playwright()
                playwright = await playwright_manager.__aenter__()
                browser = await playwright.chromium.launch(headless=self.headless)
                owned_page = await browser.new_page()

            navigation_guard = await self._install_navigation_guard(owned_page)
            result.status = BrowserTaskStatus.RUNNING

            if task.start_url:
                url = validate_url(task.start_url)
                await owned_page.goto(
                    url,
                    timeout=self.timeout_ms,
                    wait_until="domcontentloaded",
                )
                final_url = await self._validate_current_url(owned_page)
                result.results.append({
                    "action": "start_navigation",
                    "url": url,
                    "final_url": final_url,
                    "timestamp": timestamp(),
                })

            for action in task.actions:
                if action_requires_approval(action):
                    if not await self._approved(task, action):
                        result.status = BrowserTaskStatus.AWAITING_APPROVAL
                        result.error = "Explicit approval is required for this action."
                        return result

                action_result = await self._perform(owned_page, action)
                action_result["timestamp"] = timestamp()
                result.results.append(action_result)
                result.completed_actions += 1

            expectation = task.metadata.get("verification_expectation")
            if expectation is not None:
                verification = await verify_page(owned_page, expectation)
                result.verification = verification.to_dict()

                if verification.status != VerificationStatus.PASSED:
                    result.status = BrowserTaskStatus.FAILED
                    result.error = (
                        "Post-execution verification did not pass: "
                        + verification.message
                    )
                    return result

            result.status = BrowserTaskStatus.COMPLETED
            return result

        except Exception as exc:
            result.status = BrowserTaskStatus.FAILED
            result.error = str(exc)
            return result

        finally:
            if navigation_guard is not None and owned_page is not None:
                try:
                    await owned_page.unroute("**/*", navigation_guard)
                except Exception:
                    pass
            if browser is not None:
                await browser.close()
            if playwright_manager is not None:
                await playwright_manager.__aexit__(None, None, None)
