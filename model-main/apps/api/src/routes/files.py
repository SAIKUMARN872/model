"""
File API routes.

Provides endpoints for uploading, downloading, listing,
deleting, and retrieving metadata for files.
"""

from __future__ import annotations

from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import StreamingResponse

from app.auth.dependencies import get_current_user
from app.responses.response import ApiResponse
from app.services.file import FileService

router = APIRouter(
    prefix="/files",
    tags=["Files"],
)


def get_file_service() -> FileService:
    """
    Dependency for the file service.
    """
    return FileService()


@router.post(
    "/upload",
    response_model=ApiResponse[dict[str, Any]],
    status_code=status.HTTP_201_CREATED,
    summary="Upload a file",
)
async def upload_file(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    service: FileService = Depends(get_file_service),
) -> ApiResponse[dict[str, Any]]:
    """
    Upload a file.
    """

    uploaded = await service.upload(
        user_id=current_user.id,
        file=file,
    )

    return ApiResponse.ok(
        data=uploaded,
        message="File uploaded successfully.",
    )


@router.get(
    "",
    response_model=ApiResponse[list[dict[str, Any]]],
    summary="List files",
)
async def list_files(
    current_user=Depends(get_current_user),
    service: FileService = Depends(get_file_service),
) -> ApiResponse[list[dict[str, Any]]]:
    """
    List all files belonging to the current user.
    """

    files = await service.list_files(current_user.id)

    return ApiResponse.ok(
        data=files,
        message="Files retrieved successfully.",
    )


@router.get(
    "/{file_id}",
    response_model=ApiResponse[dict[str, Any]],
    summary="Get file metadata",
)
async def get_file(
    file_id: str,
    current_user=Depends(get_current_user),
    service: FileService = Depends(get_file_service),
) -> ApiResponse[dict[str, Any]]:
    """
    Retrieve metadata for a file.
    """

    file = await service.get_file(
        file_id=file_id,
        user_id=current_user.id,
    )

    if file is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found.",
        )

    return ApiResponse.ok(
        data=file,
        message="File retrieved successfully.",
    )


@router.get(
    "/{file_id}/download",
    summary="Download file",
)
async def download_file(
    file_id: str,
    current_user=Depends(get_current_user),
    service: FileService = Depends(get_file_service),
) -> StreamingResponse:
    """
    Download a file.
    """

    stream, filename, media_type = await service.download(
        file_id=file_id,
        user_id=current_user.id,
    )

    return StreamingResponse(
        stream,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )


@router.delete(
    "/{file_id}",
    response_model=ApiResponse[dict[str, Any]],
    summary="Delete file",
)
async def delete_file(
    file_id: str,
    current_user=Depends(get_current_user),
    service: FileService = Depends(get_file_service),
) -> ApiResponse[dict[str, Any]]:
    """
    Delete a file.
    """

    deleted = await service.delete(
        file_id=file_id,
        user_id=current_user.id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found.",
        )

    return ApiResponse.ok(
        data={},
        message="File deleted successfully.",
    )


@router.get(
    "/{file_id}/url",
    response_model=ApiResponse[dict[str, str]],
    summary="Generate download URL",
)
async def generate_download_url(
    file_id: str,
    current_user=Depends(get_current_user),
    service: FileService = Depends(get_file_service),
) -> ApiResponse[dict[str, str]]:
    """
    Generate a pre-signed download URL.
    """

    url = await service.generate_download_url(
        file_id=file_id,
        user_id=current_user.id,
    )

    return ApiResponse.ok(
        data={"url": url},
        message="Download URL generated successfully.",
    ) 