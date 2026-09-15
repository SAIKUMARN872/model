"""
Form interaction actions.
"""

from __future__ import annotations

from typing import Any

from .utils import (
    validate_selector,
    validate_text,
)


class FormActions:
    """Reusable form operations."""

    def __init__(
        self,
        page: Any,
        default_timeout: int = 30000,
    ) -> None:

        self.page = page
        self.default_timeout = (
            default_timeout
        )

    async def fill(
        self,
        selector: str,
        value: str,
    ) -> None:
        """Fill an input."""

        selector = validate_selector(
            selector
        )

        value = validate_text(
            value
        )

        locator = self.page.locator(
            selector
        )

        await locator.wait_for(
            state="visible",
            timeout=self.default_timeout,
        )

        await locator.fill(
            value,
            timeout=self.default_timeout,
        )

    async def clear(
        self,
        selector: str,
    ) -> None:
        """Clear an input."""

        selector = validate_selector(
            selector
        )

        locator = self.page.locator(
            selector
        )

        await locator.fill("")

    async def select_option(
        self,
        selector: str,
        value: str | None = None,
        label: str | None = None,
    ) -> None:
        """Select an option from a dropdown."""

        selector = validate_selector(
            selector
        )

        if value is None and label is None:
            raise ValueError(
                "Provide value or label."
            )

        locator = self.page.locator(
            selector
        )

        if value is not None:

            await locator.select_option(
                value=value
            )

        else:

            await locator.select_option(
                label=label
            )

    async def check(
        self,
        selector: str,
    ) -> None:
        """Check a checkbox."""

        selector = validate_selector(
            selector
        )

        locator = self.page.locator(
            selector
        )

        await locator.check(
            timeout=self.default_timeout
        )

    async def uncheck(
        self,
        selector: str,
    ) -> None:
        """Uncheck a checkbox."""

        selector = validate_selector(
            selector
        )

        locator = self.page.locator(
            selector
        )

        await locator.uncheck(
            timeout=self.default_timeout
        )

    async def fill_many(
        self,
        fields: dict[str, str],
    ) -> None:
        """Fill multiple fields."""

        for selector, value in fields.items():

            await self.fill(
                selector,
                value,
            )

    async def upload_file(
        self,
        selector: str,
        file_path: str,
    ) -> None:
        """Upload a file."""

        selector = validate_selector(
            selector
        )

        if not file_path:
            raise ValueError(
                "file_path cannot be empty."
            )

        locator = self.page.locator(
            selector
        )

        await locator.set_input_files(
            file_path
        )

    async def press(
        self,
        selector: str,
        key: str,
    ) -> None:
        """Press a keyboard key on an element."""

        selector = validate_selector(
            selector
        )

        await self.page.locator(
            selector
        ).press(key)

    async def submit(
        self,
        selector: str,
    ) -> None:
        """Submit a form."""

        selector = validate_selector(
            selector
        )

        await self.page.locator(
            selector
        ).evaluate(
            """
            form => {
                if (form.requestSubmit) {
                    form.requestSubmit();
                } else {
                    form.submit();
                }
            }
            """
        )