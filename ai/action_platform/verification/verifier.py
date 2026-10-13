"""Action verification orchestration."""

from collections.abc import Mapping
from typing import Any

from .checks import (
    check_expected_values,
    check_required_fields,
    check_status,
)
from .result import VerificationResult


class ActionVerifier:
    """Verify reported action outcomes using explicit checks."""

    def verify(
        self,
        action_id: str,
        payload: Mapping[str, Any],
        *,
        required_fields: tuple[str, ...] = ("status",),
        expected_values: Mapping[str, Any] | None = None,
        accepted_statuses: tuple[str, ...] = (
            "confirmed",
            "completed",
            "succeeded",
            "success",
        ),
    ) -> VerificationResult:
        if not isinstance(payload, Mapping):
            raise TypeError("payload must be a mapping")

        checks = check_required_fields(payload, required_fields)
        checks.update(check_expected_values(payload, expected_values or {}))
        checks.update(check_status(payload, accepted_statuses))

        verified = bool(checks) and all(checks.values())
        status_value = payload.get("status")
        status = status_value if isinstance(status_value, str) else "unknown"

        return VerificationResult(
            verified=verified,
            action_id=action_id,
            status=status,
            checks=checks,
            message=(
                "All configured checks passed."
                if verified
                else "Verification failed or the outcome is not confirmed."
            ),
            evidence={
                "checked_fields": list(payload.keys()),
            },
        )
