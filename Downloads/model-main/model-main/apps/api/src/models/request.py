"""
Request Models

Contains API request schemas.

Responsibilities:
- Validate incoming API payloads
- Define request contracts
- Ensure type safety
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, EmailStr


# ==========================
# Pagination Request
# ==========================

class PaginationRequest(BaseModel):
    """
    Common pagination request.
    """

    page: int = Field(
        default=1,
        ge=1,
        description="Page number"
    )

    limit: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Items per page"
    )


# ==========================
# User Requests
# ==========================

class UserCreateRequest(BaseModel):
    """
    Create user payload.
    """

    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        min_length=8
    )


class UserUpdateRequest(BaseModel):
    """
    Update user payload.
    """

    name: Optional[str] = None

    email: Optional[EmailStr] = None


# ==========================
# Authentication Requests
# ==========================

class LoginRequest(BaseModel):
    """
    Login request.
    """

    email: EmailStr

    password: str



class RefreshTokenRequest(BaseModel):
    """
    Refresh access token.
    """

    refresh_token: str



# ==========================
# AI Agent Requests
# ==========================

class AgentChatRequest(BaseModel):
    """
    AI Agent chat request.
    """

    message: str = Field(
        min_length=1
    )

    conversation_id: Optional[str] = None

    agent_id: Optional[str] = None

    metadata: Optional[
        Dict[str, Any]
    ] = None



class EmbeddingRequest(BaseModel):
    """
    Text embedding request.
    """

    text: str

    model: Optional[str] = None



# ==========================
# Document Requests
# ==========================

class DocumentUploadRequest(BaseModel):
    """
    Document processing request.
    """

    filename: str

    content_type: str

    metadata: Optional[
        Dict[str, Any]
    ] = None



# ==========================
# Search Requests
# ==========================

class SearchRequest(BaseModel):
    """
    Generic search request.
    """

    query: str

    filters: Optional[
        Dict[str, Any]
    ] = None

    limit: int = Field(
        default=10,
        le=50
    ) 