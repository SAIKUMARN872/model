from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from .constants import (
    ApprovalStatus,
    ComputerUseStatus,
    RiskLevel,
    VerificationStatus,
)


class PointSchema(BaseModel):
    x: int
    y: int


class BoundingBoxSchema(BaseModel):
    x: int
    y: int
    width: int
    height: int


class UIElementSchema(BaseModel):
    element_id: str
    element_type: str
    label: str | None = None
    bounds: BoundingBoxSchema | None = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    interactable: bool = True
    metadata: dict[str, Any] = Field(default_factory=dict)


class ScreenshotSchema(BaseModel):
    screenshot_id: str
    width: int
    height: int
    format: str = "png"
    path: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ComputerActionSchema(BaseModel):
    action_id: str
    action_type: str
    parameters: dict[str, Any] = Field(default_factory=dict)
    risk_level: RiskLevel = RiskLevel.LOW
    approval_status: ApprovalStatus = ApprovalStatus.NOT_REQUIRED


class ComputerRequestSchema(BaseModel):
    task: str = Field(min_length=1)
    session_id: str | None = None
    require_confirmation: bool = True
    metadata: dict[str, Any] = Field(default_factory=dict)


class ComputerResultSchema(BaseModel):
    session_id: str
    status: ComputerUseStatus
    success: bool
    message: str | None = None
    actions_executed: int = 0
    verification_status: VerificationStatus = VerificationStatus.PENDING
    metadata: dict[str, Any] = Field(default_factory=dict)
