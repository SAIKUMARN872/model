"""
Browser cookie manager.
"""

from __future__ import annotations

from typing import Any

from .security import (
    sanitize_cookies,
)
from .storage import (
    CookieStorage,
)


class CookieManager:
    """
    Manages browser cookies and persistent profiles.
    """

    def __init__(
        self,
        storage: CookieStorage | None = None,
    ) -> None:

        self.storage = (
            storage
            or CookieStorage()
        )

    async def get(
        self,
        context: Any,
    ) -> list[dict[str, Any]]:

        if context is None:

            raise ValueError(
                "Browser context is required."
            )

        return await context.cookies()

    async def add(
        self,
        context: Any,
        cookies: list[dict[str, Any]],
    ) -> None:

        if context is None:

            raise ValueError(
                "Browser context is required."
            )

        if not isinstance(
            cookies,
            list,
        ):

            raise TypeError(
                "cookies must be a list."
            )

        if not cookies:
            return

        await context.add_cookies(
            cookies
        )

    async def clear(
        self,
        context: Any,
    ) -> None:

        if context is None:

            raise ValueError(
                "Browser context is required."
            )

        await context.clear_cookies()

    async def save_profile(
        self,
        context: Any,
        profile_name: str,
    ) -> str:

        cookies = await self.get(
            context
        )

        path = self.storage.save(
            profile_name,
            cookies,
        )

        return str(path)

    async def load_profile(
        self,
        context: Any,
        profile_name: str,
    ) -> int:

        cookies = self.storage.load(
            profile_name
        )

        if cookies:

            await self.add(
                context,
                cookies,
            )

        return len(cookies)

    async def delete_profile(
        self,
        profile_name: str,
    ) -> bool:

        return self.storage.delete(
            profile_name
        )

    def profiles(
        self,
    ) -> list[str]:

        return self.storage.list_profiles()

    async def export(
        self,
        context: Any,
        profile_name: str,
    ) -> str:

        return await self.save_profile(
            context,
            profile_name,
        )

    async def import_profile(
        self,
        context: Any,
        profile_name: str,
    ) -> int:

        return await self.load_profile(
            context,
            profile_name,
        )

    async def safe_get(
        self,
        context: Any,
    ) -> list[dict[str, Any]]:

        cookies = await self.get(
            context
        )

        return sanitize_cookies(
            cookies
        )

    async def get_for_domain(
        self,
        context: Any,
        domain: str,
    ) -> list[dict[str, Any]]:

        cookies = await self.get(
            context
        )

        domain = domain.lower().strip()

        return [
            cookie
            for cookie in cookies
            if domain
            in str(
                cookie.get(
                    "domain",
                    ""
                )
            ).lower()
        ]