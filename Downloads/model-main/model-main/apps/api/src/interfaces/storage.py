"""
Storage Interface

Defines the contract for file storage providers.

Implemented by:
- AWS S3 Storage
- Azure Blob Storage
- Google Cloud Storage
- Local File Storage
"""

from abc import ABC, abstractmethod
from typing import BinaryIO, Dict, Any, Optional


class IStorage(ABC):
    """
    Abstract storage provider interface.
    """


    @abstractmethod
    async def upload(
        self,
        file: BinaryIO,
        filename: str,
        content_type: Optional[str] = None,
        path: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Upload a file.

        Returns:
            File metadata
        """
        pass



    @abstractmethod
    async def download(
        self,
        file_path: str,
    ) -> bytes:
        """
        Download file content.
        """
        pass



    @abstractmethod
    async def delete(
        self,
        file_path: str,
    ) -> bool:
        """
        Delete a file.
        """
        pass



    @abstractmethod
    async def exists(
        self,
        file_path: str,
    ) -> bool:
        """
        Check whether file exists.
        """
        pass



    @abstractmethod
    async def get_url(
        self,
        file_path: str,
        expires_in: int = 3600,
    ) -> str:
        """
        Generate temporary access URL.

        Used for:
        - Private documents
        - Resume files
        - Images
        """
        pass



    @abstractmethod
    async def list_files(
        self,
        prefix: Optional[str] = None,
    ) -> list:
        """
        List files from storage.
        """
        pass



    @abstractmethod
    async def get_metadata(
        self,
        file_path: str,
    ) -> Dict[str, Any]:
        """
        Get file metadata.
        """
        pass 