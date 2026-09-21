from __future__ import annotations

from collections.abc import Iterable

from .capabilities import ModelCapabilities
from .features import ModelFeature


def normalize_features(
    features: Iterable[ModelFeature],
) -> frozenset[ModelFeature]:
    values = set(features)

    if not all(
        isinstance(feature, ModelFeature)
        for feature in values
    ):
        raise TypeError(
            "features must contain only ModelFeature values"
        )

    return frozenset(values)


def capabilities_from_features(
    features: Iterable[ModelFeature],
) -> ModelCapabilities:
    return ModelCapabilities(
        features=normalize_features(features)
    )


def supports_all(
    capabilities: ModelCapabilities,
    features: Iterable[ModelFeature],
) -> bool:
    if not isinstance(
        capabilities,
        ModelCapabilities,
    ):
        raise TypeError(
            "capabilities must be a ModelCapabilities"
        )

    return capabilities.supports_all(
        features
    )


def supports_any(
    capabilities: ModelCapabilities,
    features: Iterable[ModelFeature],
) -> bool:
    if not isinstance(
        capabilities,
        ModelCapabilities,
    ):
        raise TypeError(
            "capabilities must be a ModelCapabilities"
        )

    return capabilities.supports_any(
        features
    )


def feature_names(
    capabilities: ModelCapabilities,
) -> tuple[str, ...]:
    if not isinstance(
        capabilities,
        ModelCapabilities,
    ):
        raise TypeError(
            "capabilities must be a ModelCapabilities"
        )

    return capabilities.feature_names


__all__ = [
    "normalize_features",
    "capabilities_from_features",
    "supports_all",
    "supports_any",
    "feature_names",
]
