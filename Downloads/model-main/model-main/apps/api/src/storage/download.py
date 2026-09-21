"""
Storage download service.

Handles secure file downloading from storage providers
(local storage, S3, cloud object storage).
"""

from __future__ import annotations

from io import BytesIO
from typing import BinaryIO

from fastapi import HTTPException, status

from app.adapters.storage import StorageAdapter
from app.core.logging import logger


class DownloadService:
    """
    File download service.
    """

    def __init__(
        self,
        storage: StorageAdapter | None = None,
    ) -> None:

        self._storage = storage or StorageAdapter()


    async def download(
        self,
        file_key: str,
    ) -> BinaryIO:
        """
        Download file content.

        Args:
            file_key:
                Unique storage key/path.

        Returns:
            File binary stream.
        """

        try:

            file_content = await self._storage.get(
                file_key,
            )

            if file_content is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="File not found.",
                )


            if isinstance(
                file_content,
                bytes,
            ):
                return BytesIO(
                    file_content,
                )


            return file_content


        except HTTPException:
            raise


        except Exception as exc:

            logger.exception(
                "File download failed",
                exc_info=exc,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to download file.",
            )


    async def download_bytes(
        self,
        file_key: str,
    ) -> bytes:
        """
        Download file as bytes.
        """

        stream = await self.download(
            file_key,
        )

        return stream.read()


    async def get_download_url(
        self,
        file_key: str,
        expires_in: int = 3600,
    ) -> str:
        """
        Generate temporary signed download URL.

        Used for S3/GCS/Azure Blob storage.
        """

        try:

            url = await self._storage.generate_signed_url(
                key=file_key,
                expires_in=expires_in,
            )

            return url


        except Exception as exc:

            logger.exception(
                "Failed generating download URL",
                exc_info=exc,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to generate download URL.",
            )