from typing import Any

from .checks import verify_action, verify_page, verify_result
from .results import VerificationResult, VerificationStatus

__all__ = [
    "VerificationResult",
    "VerificationStatus",
    "verify_action",
    "verify_page",
    "verify_result",
]
