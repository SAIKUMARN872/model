from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable

from .features import ModelFeature
from .limits import CapabilityLimits


@dataclass(frozen=True)
class ModelCapabilities:
    """
    Normalized capability profile for a ModelNow model.
    """

    features: frozenset[ModelFeature] = field(
        default_factory=frozenset
    )
    limits: CapabilityLimits = field(
        default_factory=CapabilityLimits
    )

    def __post_init__(self) -> None:
        if not isinstance(
            self.features,
            frozenset,
        ):
            raise TypeError(
                "features must be a frozenset"
            )

        if not all(
            isinstance(feature, ModelFeature)
            for feature in self.features
        ):
            raise TypeError(
                "features must contain only ModelFeature values"
            )

        if not isinstance(
            self.limits,
            CapabilityLimits,
        ):
            raise TypeError(
                "limits must be a CapabilityLimits"
            )

    def supports(
        self,
        feature: ModelFeature,
    ) -> bool:
        if not isinstance(
            feature,
            ModelFeature,
        ):
            raise TypeError(
                "feature must be a ModelFeature"
            )

        return feature in self.features

    def supports_all(
        self,
        features: Iterable[ModelFeature],
    ) -> bool:
        required = set(features)

        if not all(
            isinstance(feature, ModelFeature)
            for feature in required
        ):
            raise TypeError(
                "features must contain only ModelFeature values"
            )

        return required.issubset(
            self.features
        )

    def supports_any(
        self,
        features: Iterable[ModelFeature],
    ) -> bool:
        required = set(features)

        if not all(
            isinstance(feature, ModelFeature)
            for feature in required
        ):
            raise TypeError(
                "features must contain only ModelFeature values"
            )

        return bool(
            required.intersection(
                self.features
            )
        )

    def with_feature(
        self,
        feature: ModelFeature,
    ) -> "ModelCapabilities":
        if not isinstance(
            feature,
            ModelFeature,
        ):
            raise TypeError(
                "feature must be a ModelFeature"
            )

        return ModelCapabilities(
            features=self.features | {feature},
            limits=self.limits,
        )

    def without_feature(
        self,
        feature: ModelFeature,
    ) -> "ModelCapabilities":
        if not isinstance(
            feature,
            ModelFeature,
        ):
            raise TypeError(
                "feature must be a ModelFeature"
            )

        return ModelCapabilities(
            features=self.features - {feature},
            limits=self.limits,
        )

    @property
    def feature_names(self) -> tuple[str, ...]:
        return tuple(
            sorted(
                feature.value
                for feature in self.features
            )
        )


__all__ = ["ModelCapabilities"]
