from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from .constants import (
    ApprovalStatus,
    ComputerUseStatus,
    RiskLevel,
    VerificationStatus,
    WindowState,
)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class Point:
    x: int
    y: int


@dataclass
class ScreenSize:
    width: int
    height: int


@dataclass
class BoundingBox:
    x: int
    y: int
    width: int
    height: int


@dataclass
class UIElement:
    element_id: str
    element_type: str
    label: str | None = None
    bounds: BoundingBox | None = None
    confidence: float = 0.0
    interactable: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class Screenshot:
    screenshot_id: str
    width: int
    height: int
    format: str = "png"
    path: str | None = None
    captured_at: datetime = field(default_factory=utc_now)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class Application:
    application_id: str
    name: str
    executable: str | None = None
    process_id: int | None = None
    running: bool = False
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class Window:
    window_id: str
    title: str
    application_id: str | None = None
    bounds: BoundingBox | None = None
    state: WindowState = WindowState.NORMAL
    focused: bool = False
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ComputerState:
    status: ComputerUseStatus = ComputerUseStatus.IDLE
    screen_size: ScreenSize | None = None
    active_application: Application | None = None
    active_window: Window | None = None
    ui_elements: list[UIElement] = field(default_factory=list)
    screenshot: Screenshot | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ComputerAction:
    action_id: str
    action_type: str
    parameters: dict[str, Any] = field(default_factory=dict)
    risk_level: RiskLevel = RiskLevel.LOW
    approval_status: ApprovalStatus = ApprovalStatus.NOT_REQUIRED
    status: ComputerUseStatus = ComputerUseStatus.IDLE
    created_at: datetime = field(default_factory=utc_now)


@dataclass
class VerificationResult:
    status: VerificationStatus
    success: bool
    message: str | None = None
    evidence: dict[str, Any] = field(default_factory=dict)


@dataclass
class ComputerSession:
    session_id: str
    status: ComputerUseStatus = ComputerUseStatus.IDLE
    actions: list[ComputerAction] = field(default_factory=list)
    state: ComputerState = field(default_factory=ComputerState)
    started_at: datetime | None = None
    ended_at: datetime | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
