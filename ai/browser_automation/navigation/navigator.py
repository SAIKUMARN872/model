"""
Browser navigation executor.
"""

from __future__ import annotations

from typing import Any

from .planner import (
    NavigationAction,
    NavigationPlan,
)
from .utils import (
    validate_url,
)


class Navigator:
    """
    Executes NavigationPlan objects against a browser
    driver or browser agent.
    """

    def __init__(
        self,
        browser: Any,
    ) -> None:

        if browser is None:

            raise ValueError(
                "browser is required."
            )

        self.browser = browser

    async def goto(
        self,
        url: str,
        **kwargs: Any,
    ) -> Any:

        url = validate_url(
            url
        )

        return await self.browser.goto(
            url,
            **kwargs,
        )

    async def back(
        self,
    ) -> Any:

        method = getattr(
            self.browser,
            "back",
            None,
        )

        if method is None:

            page = self._page()

            return await page.go_back()

        return await method()

    async def forward(
        self,
    ) -> Any:

        method = getattr(
            self.browser,
            "forward",
            None,
        )

        if method is None:

            page = self._page()

            return await page.go_forward()

        return await method()

    async def reload(
        self,
    ) -> Any:

        method = getattr(
            self.browser,
            "reload",
            None,
        )

        if method is None:

            page = self._page()

            return await page.reload()

        return await method()

    async def wait(
        self,
        milliseconds: int,
    ) -> None:

        if milliseconds < 0:

            raise ValueError(
                "milliseconds cannot be negative."
            )

        page = self._page()

        await page.wait_for_timeout(
            milliseconds
        )

    async def execute(
        self,
        plan: NavigationPlan,
    ) -> list[Any]:

        results = []

        for step in plan.steps:

            if (
                step.action
                == NavigationAction.GOTO
            ):

                if not step.url:
                    raise ValueError(
                        "GOTO step requires URL."
                    )

                result = await self.goto(
                    step.url,
                    wait_until=(
                        step.wait_until
                    ),
                    timeout=step.timeout,
                )

            elif (
                step.action
                == NavigationAction.BACK
            ):

                result = await self.back()

            elif (
                step.action
                == NavigationAction.FORWARD
            ):

                result = await self.forward()

            elif (
                step.action
                == NavigationAction.RELOAD
            ):

                result = await self.reload()

            elif (
                step.action
                == NavigationAction.WAIT
            ):

                milliseconds = int(
                    step.metadata.get(
                        "milliseconds",
                        0,
                    )
                )

                result = await self.wait(
                    milliseconds
                )

            else:

                raise ValueError(
                    f"Unsupported navigation action: "
                    f"{step.action}"
                )

            results.append(
                result
            )

        return results

    def _page(self) -> Any:

        page = getattr(
            self.browser,
            "page",
            None,
        )

        if page is None:

            raise RuntimeError(
                "Browser does not expose an active page."
            )

        return page