"""
Storage Adapter

Enterprise Storage Adapter

Responsibilities
----------------
- Upload Files
- Download Files
- Delete Files
- Generate Signed URLs
- Health Check
"""

from __future__ import annotations

import os
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

from config.logging import log
from config.settings import settings


class StorageAdapter:
    """
    Enterprise Storage Adapter
    """

    def __init__(self) -> None:

        self.bucket = settings.S3_BUCKET_NAME

        self.client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )

    # ==========================================================
    # Upload File
    # ==========================================================

    async def upload(
        self,
        local_path: str,
        object_name: str,
    ) -> str:

        try:

            self.client.upload_file(
                Filename=local_path,
                Bucket=self.bucket,
                Key=object_name,
            )

            url = (
                f"https://{self.bucket}.s3."
                f"{settings.AWS_REGION}.amazonaws.com/"
                f"{object_name}"
            )

            log.info(f"Uploaded {object_name}")

            return url

        except ClientError as exc:

            log.exception(
                "S3 upload failed.",
                error=str(exc),
            )

            raise

    # ==========================================================
    # Download File
    # ==========================================================

    async def download(
        self,
        object_name: str,
        destination: str,
    ) -> str:

        try:

            Path(destination).parent.mkdir(
                parents=True,
                exist_ok=True,
            )

            self.client.download_file(
                Bucket=self.bucket,
                Key=object_name,
                Filename=destination,
            )

            log.info(f"Downloaded {object_name}")

            return destination

        except ClientError as exc:

            log.exception(
                "S3 download failed.",
                error=str(exc),
            )

            raise

    # ==========================================================
    # Delete File
    # ==========================================================

    async def delete(
        self,
        object_name: str,
    ) -> bool:

        try:

            self.client.delete_object(
                Bucket=self.bucket,
                Key=object_name,
            )

            log.info(f"Deleted {object_name}")

            return True

        except ClientError as exc:

            log.exception(
                "S3 delete failed.",
                error=str(exc),
            )

            return False

    # ==========================================================
    # File Exists
    # ==========================================================

    async def exists(
        self,
        object_name: str,
    ) -> bool:

        try:

            self.client.head_object(
                Bucket=self.bucket,
                Key=object_name,
            )

            return True

        except ClientError:

            return False

    # ==========================================================
    # Generate Signed URL
    # ==========================================================

    async def signed_url(
        self,
        object_name: str,
        expires: int = 3600,
    ) -> str:

        return self.client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": self.bucket,
                "Key": object_name,
            },
            ExpiresIn=expires,
        )

    # ==========================================================
    # List Files
    # ==========================================================

    async def list_files(
        self,
        prefix: str = "",
    ) -> list[str]:

        response = self.client.list_objects_v2(
            Bucket=self.bucket,
            Prefix=prefix,
        )

        files = []

        for obj in response.get("Contents", []):

            files.append(obj["Key"])

        return files

    # ==========================================================
    # Health Check
    # ==========================================================

    async def health(self) -> bool:

        try:

            self.client.head_bucket(
                Bucket=self.bucket,
            )

            return True

        except Exception as exc:

            log.exception(
                "Storage health check failed.",
                error=str(exc),
            )

            return False 