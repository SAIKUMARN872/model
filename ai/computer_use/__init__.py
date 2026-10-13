"""Public API for ModelNow Computer Use."""

from .applications import ApplicationAdapter, ApplicationController, ApplicationManager
from .computer import Computer
from .controller import ComputerController
from .desktop import Desktop, DesktopComputer
from .exceptions import (
    ApprovalRequiredError,
    ApplicationNotFoundError,
    ComputerActionError,
    ComputerInitializationError,
    ComputerUseError,
    ScreenCaptureError,
    SecurityViolationError,
    UIElementNotFoundError,
    VerificationError,
    WindowNotFoundError,
)
from .models import (
    Application,
    BoundingBox,
    ComputerAction,
    ComputerSession,
    ComputerState,
    Point,
    Screenshot,
    ScreenSize,
    UIElement,
    VerificationResult,
    Window,
)
from .windows import WindowAdapter, WindowController, WindowManager

__all__ = [
    "Computer",
    "ComputerController",
    "Desktop",
    "DesktopComputer",
    "ApplicationAdapter",
    "ApplicationController",
    "ApplicationManager",
    "WindowAdapter",
    "WindowController",
    "WindowManager",
    "Point",
    "ScreenSize",
    "BoundingBox",
    "UIElement",
    "Screenshot",
    "Application",
    "Window",
    "ComputerState",
    "ComputerAction",
    "ComputerSession",
    "VerificationResult",
    "ComputerUseError",
    "ComputerInitializationError",
    "ComputerActionError",
    "ScreenCaptureError",
    "UIElementNotFoundError",
    "WindowNotFoundError",
    "ApplicationNotFoundError",
    "ApprovalRequiredError",
    "SecurityViolationError",
    "VerificationError",
]

from .windows.backend import WindowsComputerBackend


__all__ = [*__all__, 'WindowsComputerBackend']


from .windows.factory import WindowsComputer, create_windows_computer


__all__ = [*__all__, 'WindowsComputer', 'create_windows_computer']


from .verification import StructuredEvidenceVerifier

__all__ = [*__all__, "StructuredEvidenceVerifier"]

from .ocr import TesseractOCRBackend
__all__ = [*__all__, "TesseractOCRBackend"]

