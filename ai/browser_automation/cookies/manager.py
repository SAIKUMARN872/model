from __future__ import annotations

from typing import Any

from .security import validate_cookie_data


class CookieManager:
    """Validate and manage cookies through a Playwright browser context."""

    def __init__(self, context: Any) -> None:
        if context is None:
            raise ValueError("A browser context is required.")
        self.context = context

    async def get_cookies(self, urls: list[str] | None = None) -> list[dict[str, Any]]:
        if urls is not None:
            if not isinstance(urls, list) or not all(
                isinstance(url, str) and url.startswith(("http://", "https://"))
                for url in urls
            ):
                raise ValueError("Cookie retrieval URLs must use HTTP or HTTPS.")
            cookies = await self.context.cookies(urls)
        else:
            cookies = await self.context.cookies()

        return [validate_cookie_data(cookie) for cookie in cookies]

    async def add_cookies(self, cookies: list[dict[str, Any]]) -> None:
        if not isinstance(cookies, list):
            raise ValueError("Cookies must be provided as a list.")

        validated = [validate_cookie_data(cookie) for cookie in cookies]
        await self.context.add_cookies(validated)

    async def clear_cookies(self) -> None:
        await self.context.clear_cookies()

    async def save_to_storage(self, storage) -> None:
        cookies = await self.get_cookies()
        storage.save(cookies)

    async def load_from_storage(self, storage) -> None:
        cookies = storage.load()
        if cookies:
            await self.context.add_cookies(cookies)
