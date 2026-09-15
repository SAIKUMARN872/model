"""
Permission management for browser automation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Iterable


class Permission(
    str,
    Enum,
):
    NAVIGATE = "navigate"
    READ = "read"
    WRITE = "write"
    DOWNLOAD = "download"
    UPLOAD = "upload"
    SCRIPT = "script"
    COOKIES = "cookies"
    SCREENSHOT = "screenshot"


@dataclass
class PermissionSet:
    """Set of permissions granted to an automation task."""

    permissions: set[Permission] = field(
        default_factory=set
    )

    def grant(
        self,
        permission: Permission,
    ) -> None:

        self.permissions.add(
            permission
        )

    def revoke(
        self,
        permission: Permission,
    ) -> None:

        self.permissions.discard(
            permission
        )

    def allows(
        self,
        permission: Permission,
    ) -> bool:

        return permission in self.permissions

    def require(
        self,
        permission: Permission,
    ) -> None:

        if not self.allows(
            permission
        ):

            raise PermissionError(
                f"Permission denied: "
                f"{permission.value}"
            )

    def grant_many(
        self,
        permissions: Iterable[Permission],
    ) -> None:

        for permission in permissions:

            self.grant(
                permission
            )

    def revoke_many(
        self,
        permissions: Iterable[Permission],
    ) -> None:

        for permission in permissions:

            self.revoke(
                permission
            )

    def to_strings(
        self,
    ) -> list[str]:

        return sorted(
            permission.value
            for permission in self.permissions
        )


class PermissionManager:
    """Manages permissions for tasks and agents."""

    def __init__(self) -> None:

        self._permissions: dict[
            str,
            PermissionSet,
        ] = {}

    def create(
        self,
        subject_id: str,
        permissions: Iterable[Permission] | None = None,
    ) -> PermissionSet:

        subject_id = subject_id.strip()

        if not subject_id:

            raise ValueError(
                "subject_id cannot be empty."
            )

        permission_set = PermissionSet()

        if permissions:

            permission_set.grant_many(
                permissions
            )

        self._permissions[
            subject_id
        ] = permission_set

        return permission_set

    def get(
        self,
        subject_id: str,
    ) -> PermissionSet | None:

        return self._permissions.get(
            subject_id
        )

    def check(
        self,
        subject_id: str,
        permission: Permission,
    ) -> bool:

        permission_set = self.get(
            subject_id
        )

        if permission_set is None:
            return False

        return permission_set.allows(
            permission
        )

    def require(
        self,
        subject_id: str,
        permission: Permission,
    ) -> None:

        permission_set = self.get(
            subject_id
        )

        if permission_set is None:

            raise PermissionError(
                f"No permissions configured "
                f"for '{subject_id}'."
            )

        permission_set.require(
            permission
        )

    def remove(
        self,
        subject_id: str,
    ) -> PermissionSet | None:

        return self._permissions.pop(
            subject_id,
            None,
        )

    def clear(self) -> None:

        self._permissions.clear()