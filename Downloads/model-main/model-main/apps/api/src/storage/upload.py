"""
Storage upload service.

Handles secure file uploads to storage providers
(local filesystem, S3, cloud object storage).
"""

from __future__ import annotations

from typing import BinaryIO
from uuid import uuid4

from fastapi import UploadFile, HTTPException, status

from app.adapters.storage import StorageAdapter
from app.core.logging import logger


class UploadService:
    """
    File upload service.
    """

    def __init__(
        self,
        storage: StorageAdapter | None = None,
    ) -> None:

        self._storage = storage or StorageAdapter()


    async def upload(
        self,
        file: UploadFile,
        folder: str = "uploads",
    ) -> dict:
        """
        Upload a file.

        Args:
            file:
                FastAPI uploaded file.

            folder:
                Storage folder path.

        Returns:
            Uploaded file metadata.
        """

        try:

            file_extension = ""

            if file.filename and "." in file.filename:
                file_extension = (
                    file.filename.split(".")[-1]
                )


            file_key = (
                f"{folder}/"
                f"{uuid4().hex}"
            )

            if file_extension:
                file_key += f".{file_extension}"


            content = await file.read()


            await self._storage.put(
                key=file_key,
                data=content,
                content_type=file.content_type,
            )


            logger.info(
                "File uploaded successfully: %s",
                file_key,
            )


            return {
                "file_key": file_key,
                "filename": file.filename,
                "content_type": file.content_type,
                "size": len(content),
            }


        except Exception as exc:

            logger.exception(
                "File upload failed",
                exc_info=exc,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to upload file.",
            )


    async def upload_stream(
        self,
        stream: BinaryIO,
        filename: str,
        content_type: str | None = None,
        folder: str = "uploads",
    ) -> dict:
        """
        Upload file stream.

        Useful for large files.
        """

        try:

            file_key = (
                f"{folder}/"
                f"{uuid4().hex}_"
                f"{filename}"
            )


            await self._storage.put_stream(
                key=file_key,
                stream=stream,
                content_type=content_type,
            )


            return {
                "file_key": file_key,
                "filename": filename,
                "content_type": content_type,
            }


        except Exception as exc:

            logger.exception(
                "Stream upload failed",
                exc_info=exc,
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to upload stream.",
            )


    async def validate_file(
        self,
        file: UploadFile,
        max_size: int = 10 * 1024 * 1024,
        allowed_types: list[str] | None = None,
    ) -> bool:
        """
        Validate uploaded file.

        Default:
        - Max size: 10MB
        """

        if allowed_types:

            if file.content_type not in allowed_types:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File type not allowed.",
                )


        content = await file.read()

        await file.seek(0)


        if len(content) > max_size:

            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds limit.",
            )


        return True