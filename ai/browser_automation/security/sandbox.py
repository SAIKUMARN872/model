"""
Sandbox policy for browser automation.

Provides restrictions around URLs, file operations,
downloads and script execution.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

from .validator import (
    SecurityConfig,
    SecurityValidator,
)


@dataclass
class SandboxPolicy:
    """Controls what an automation task may access."""

    allowed_domains: set[str] = field(
        default_factory=set
    )

    allowed_paths: set[str] = field(
        default_factory=set
    )

    allow_downloads: bool = False

    allow_uploads: bool = False

    allow_javascript: bool = False

    max_file_size: int = 10 * 1024 * 1024

    def validator(
        self,
    ) -> SecurityValidator:

        return SecurityValidator(
            SecurityConfig(
                allowed_domains=(
                    self.allowed_domains
                    or None
                )
            )
        )


class Sandbox:
    """
    Security boundary for browser automation.
    """

    def __init__(
        self,
        policy: SandboxPolicy | None = None,
    ) -> None:

        self.policy = (
            policy
            or SandboxPolicy()
        )

        self._validator = (
            self.policy.validator()
        )

    def validate_url(
        self,
        url: str,
    ) -> str:

        return self._validator.validate_url(
            url
        )

    def validate_file_path(
        self,
        path: str,
    ) -> Path:

        if not isinstance(
            path,
            str,
        ):

            raise TypeError(
                "File path must be a string."
            )

        if not self.policy.allowed_paths:

            raise PermissionError(
                "File access is disabled by sandbox policy."
            )

        requested = Path(
            path
        ).expanduser().resolve()

        for allowed_path in (
            self.policy.allowed_paths
        ):

            root = Path(
                allowed_path
            ).expanduser().resolve()

            try:

                requested.relative_to(
                    root
                )

                return requested

            except ValueError:

                continue

        raise PermissionError(
            f"File path is outside sandbox: "
            f"{requested}"
        )

    def validate_download(
        self,
        path: str,
        size: int | None = None,
    ) -> Path:

        if not self.policy.allow_downloads:

            raise PermissionError(
                "Downloads are disabled by sandbox policy."
            )

        validated = self.validate_file_path(
            path
        )

        if (
            size is not None
            and size > self.policy.max_file_size
        ):

            raise PermissionError(
                "Download exceeds sandbox file-size limit."
            )

        return validated

    def validate_upload(
        self,
        path: str,
    ) -> Path:

        if not self.policy.allow_uploads:

            raise PermissionError(
                "Uploads are disabled by sandbox policy."
            )

        validated = self.validate_file_path(
            path
        )

        if validated.exists():

            if (
                validated.stat().st_size
                > self.policy.max_file_size
            ):

                raise PermissionError(
                    "Upload exceeds sandbox file-size limit."
                )

        return validated

    def validate_script(
        self,
        script: str,
    ) -> str:

        if not self.policy.allow_javascript:

            raise PermissionError(
                "JavaScript execution is disabled."
            )

        if not isinstance(
            script,
            str,
        ):

            raise TypeError(
                "Script must be a string."
            )

        if not script.strip():

            raise ValueError(
                "Script cannot be empty."
            )

        return script