"""
Security package for browser automation.
"""

from .permissions import (
    Permission,
    PermissionManager,
    PermissionSet,
)

from .sandbox import (
    Sandbox,
    SandboxPolicy,
)

from .validator import (
    SecurityConfig,
    SecurityValidationError,
    SecurityValidator,
)


__all__ = [
    "Permission",
    "PermissionSet",
    "PermissionManager",
    "Sandbox",
    "SandboxPolicy",
    "SecurityConfig",
    "SecurityValidationError",
    "SecurityValidator",
]


__version__ = "1.0.0"