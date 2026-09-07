"""
HTTP Client

Enterprise Async HTTP Client

Features
--------
✓ Async Requests
✓ Connection Pooling
✓ Retry Ready
✓ Timeout
✓ GET
✓ POST
✓ PUT
✓ PATCH
✓ DELETE
✓ Health Check
"""

from __future__ import annotations

from typing import Any

import httpx

from config.logging import log
from config.settings import settings


class HttpClient:
    """
    Enterprise HTTP Client.
    """

    def __init__(self) -> None:

        self.client = httpx.AsyncClient(

            timeout=settings.HTTP_TIMEOUT,

            limits=httpx.Limits(
                max_connections=100,
                max_keepalive_connections=20,
            ),

            follow_redirects=True,

            headers={
                "User-Agent": settings.APP_NAME,
                "Accept": "application/json",
            },
        )

    # ---------------------------------------------------------
    # GET
    # ---------------------------------------------------------

    async def get(
        self,
        url: str,
        *,
        params: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> httpx.Response:

        response = await self.client.get(
            url,
            params=params,
            headers=headers,
        )

        response.raise_for_status()

        return response

    # ---------------------------------------------------------
    # POST
    # ---------------------------------------------------------

    async def post(
        self,
        url: str,
        *,
        json: dict[str, Any] | None = None,
        data: Any = None,
        headers: dict[str, str] | None = None,
    ) -> httpx.Response:

        response = await self.client.post(
            url,
            json=json,
            data=data,
            headers=headers,
        )

        response.raise_for_status()

        return response

    # ---------------------------------------------------------
    # PUT
    # ---------------------------------------------------------

    async def put(
        self,
        url: str,
        *,
        json: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> httpx.Response:

        response = await self.client.put(
            url,
            json=json,
            headers=headers,
        )

        response.raise_for_status()

        return response

    # ---------------------------------------------------------
    # PATCH
    # ---------------------------------------------------------

    async def patch(
        self,
        url: str,
        *,
        json: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> httpx.Response:

        response = await self.client.patch(
            url,
            json=json,
            headers=headers,
        )

        response.raise_for_status()

        return response

    # ---------------------------------------------------------
    # DELETE
    # ---------------------------------------------------------

    async def delete(
        self,
        url: str,
        *,
        headers: dict[str, str] | None = None,
    ) -> httpx.Response:

        response = await self.client.delete(
            url,
            headers=headers,
        )

        response.raise_for_status()

        return response

    # ---------------------------------------------------------
    # Health Check
    # ---------------------------------------------------------

    async def health(
        self,
        url: str = "https://www.google.com",
    ) -> bool:

        try:

            response = await self.client.get(url)

            return response.status_code == 200

        except Exception as exc:

            log.exception(
                "HTTP health check failed",
                error=str(exc),
            )

            return False

    # ---------------------------------------------------------
    # Close Client
    # ---------------------------------------------------------

    async def close(self) -> None:

        await self.client.aclose()

        log.info("HTTP Client closed.") 