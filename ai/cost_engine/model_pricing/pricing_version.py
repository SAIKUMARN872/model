"""
Pricing version management.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict


@dataclass(frozen=True)
class PricingVersion:
    """
    Represents one version of a pricing catalog.
    """

    version: str

    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    description: str = ""

    active: bool = True

    metadata: Dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:
        if not self.version:
            raise ValueError(
                "version cannot be empty"
            )

    def to_dict(self) -> dict[str, Any]:
        return {
            "version": self.version,
            "created_at": self.created_at.isoformat(),
            "description": self.description,
            "active": self.active,
            "metadata": self.metadata,
        }


class PricingVersionManager:
    """
    Stores and manages pricing versions.
    """

    def __init__(self) -> None:
        self._versions: dict[str, PricingVersion] = {}
        self._active_version: str | None = None

    def register(
        self,
        version: PricingVersion,
    ) -> PricingVersion:

        self._versions[version.version] = version

        if version.active:
            self._active_version = version.version

        return version

    def get(
        self,
        version: str,
    ) -> PricingVersion | None:

        return self._versions.get(version)

    def require(
        self,
        version: str,
    ) -> PricingVersion:

        result = self.get(version)

        if result is None:
            raise KeyError(
                f"Pricing version not found: {version}"
            )

        return result

    def activate(
        self,
        version: str,
    ) -> PricingVersion:

        pricing_version = self.require(version)

        updated = PricingVersion(
            version=pricing_version.version,
            created_at=pricing_version.created_at,
            description=pricing_version.description,
            active=True,
            metadata=pricing_version.metadata,
        )

        self._versions[version] = updated
        self._active_version = version

        for key, item in list(
            self._versions.items()
        ):
            if key == version:
                continue

            if item.active:
                self._versions[key] = PricingVersion(
                    version=item.version,
                    created_at=item.created_at,
                    description=item.description,
                    active=False,
                    metadata=item.metadata,
                )

        return updated

    def deactivate(
        self,
        version: str,
    ) -> PricingVersion:

        pricing_version = self.require(version)

        updated = PricingVersion(
            version=pricing_version.version,
            created_at=pricing_version.created_at,
            description=pricing_version.description,
            active=False,
            metadata=pricing_version.metadata,
        )

        self._versions[version] = updated

        if self._active_version == version:
            self._active_version = None

        return updated

    @property
    def active_version(
        self,
    ) -> PricingVersion | None:

        if self._active_version is None:
            return None

        return self._versions.get(
            self._active_version
        )

    def all_versions(
        self,
    ) -> list[PricingVersion]:

        return list(
            self._versions.values()
        )