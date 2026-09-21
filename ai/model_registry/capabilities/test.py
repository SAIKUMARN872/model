from __future__ import annotations

import unittest

from .capabilities import ModelCapabilities
from .features import ModelFeature
from .limits import CapabilityLimits
from .utils import (
    capabilities_from_features,
    feature_names,
    normalize_features,
    supports_all,
    supports_any,
)


class TestModelFeature(unittest.TestCase):

    def test_feature_values(self):
        self.assertEqual(
            ModelFeature.CHAT.value,
            "chat",
        )
        self.assertEqual(
            ModelFeature.REASONING.value,
            "reasoning",
        )
        self.assertEqual(
            ModelFeature.CODE.value,
            "code",
        )
        self.assertEqual(
            ModelFeature.VISION.value,
            "vision",
        )

    def test_feature_is_string_enum(self):
        self.assertEqual(
            str(ModelFeature.CHAT),
            "ModelFeature.CHAT",
        )
        self.assertEqual(
            ModelFeature.CHAT,
            "chat",
        )


class TestCapabilityLimits(unittest.TestCase):

    def test_default_limits(self):
        limits = CapabilityLimits()

        self.assertEqual(
            limits.context_window,
            0,
        )
        self.assertEqual(
            limits.max_output_tokens,
            0,
        )
        self.assertEqual(
            limits.max_images,
            0,
        )
        self.assertEqual(
            limits.max_audio_seconds,
            0.0,
        )
        self.assertEqual(
            limits.max_file_size_mb,
            0.0,
        )
        self.assertEqual(
            limits.max_tools,
            0,
        )

    def test_custom_limits(self):
        limits = CapabilityLimits(
            context_window=128000,
            max_output_tokens=8192,
            max_images=10,
            max_audio_seconds=3600.0,
            max_file_size_mb=100.0,
            max_tools=64,
        )

        self.assertEqual(
            limits.context_window,
            128000,
        )
        self.assertEqual(
            limits.max_output_tokens,
            8192,
        )
        self.assertEqual(
            limits.max_images,
            10,
        )
        self.assertEqual(
            limits.max_audio_seconds,
            3600.0,
        )
        self.assertEqual(
            limits.max_file_size_mb,
            100.0,
        )
        self.assertEqual(
            limits.max_tools,
            64,
        )

    def test_negative_context_window_rejected(self):
        with self.assertRaises(ValueError):
            CapabilityLimits(
                context_window=-1,
            )

    def test_negative_output_tokens_rejected(self):
        with self.assertRaises(ValueError):
            CapabilityLimits(
                max_output_tokens=-1,
            )

    def test_negative_images_rejected(self):
        with self.assertRaises(ValueError):
            CapabilityLimits(
                max_images=-1,
            )

    def test_negative_audio_rejected(self):
        with self.assertRaises(ValueError):
            CapabilityLimits(
                max_audio_seconds=-1,
            )

    def test_negative_file_size_rejected(self):
        with self.assertRaises(ValueError):
            CapabilityLimits(
                max_file_size_mb=-1,
            )

    def test_negative_tools_rejected(self):
        with self.assertRaises(ValueError):
            CapabilityLimits(
                max_tools=-1,
            )


class TestModelCapabilities(unittest.TestCase):

    def setUp(self):
        self.capabilities = ModelCapabilities(
            features=frozenset(
                {
                    ModelFeature.CHAT,
                    ModelFeature.CODE,
                    ModelFeature.VISION,
                }
            ),
            limits=CapabilityLimits(
                context_window=128000,
                max_output_tokens=8192,
                max_images=20,
                max_tools=32,
            ),
        )

    def test_default_capabilities(self):
        capabilities = ModelCapabilities()

        self.assertEqual(
            capabilities.features,
            frozenset(),
        )
        self.assertEqual(
            capabilities.limits,
            CapabilityLimits(),
        )

    def test_feature_validation(self):
        with self.assertRaises(TypeError):
            ModelCapabilities(
                features={
                    ModelFeature.CHAT,
                },
            )

    def test_invalid_feature_value_rejected(self):
        with self.assertRaises(TypeError):
            ModelCapabilities(
                features=frozenset(
                    {
                        "chat",
                    }
                ),
            )

    def test_supports(self):
        self.assertTrue(
            self.capabilities.supports(
                ModelFeature.CHAT
            )
        )
        self.assertFalse(
            self.capabilities.supports(
                ModelFeature.AUDIO
            )
        )

    def test_supports_invalid_feature(self):
        with self.assertRaises(TypeError):
            self.capabilities.supports(
                "chat"
            )

    def test_supports_all(self):
        self.assertTrue(
            self.capabilities.supports_all(
                {
                    ModelFeature.CHAT,
                    ModelFeature.CODE,
                }
            )
        )

        self.assertFalse(
            self.capabilities.supports_all(
                {
                    ModelFeature.CHAT,
                    ModelFeature.AUDIO,
                }
            )
        )

    def test_supports_any(self):
        self.assertTrue(
            self.capabilities.supports_any(
                {
                    ModelFeature.AUDIO,
                    ModelFeature.CODE,
                }
            )
        )

        self.assertFalse(
            self.capabilities.supports_any(
                {
                    ModelFeature.AUDIO,
                    ModelFeature.AGENTIC,
                }
            )
        )

    def test_with_feature(self):
        updated = self.capabilities.with_feature(
            ModelFeature.AUDIO
        )

        self.assertTrue(
            updated.supports(
                ModelFeature.AUDIO
            )
        )
        self.assertFalse(
            self.capabilities.supports(
                ModelFeature.AUDIO
            )
        )

    def test_without_feature(self):
        updated = self.capabilities.without_feature(
            ModelFeature.CODE
        )

        self.assertFalse(
            updated.supports(
                ModelFeature.CODE
            )
        )
        self.assertTrue(
            self.capabilities.supports(
                ModelFeature.CODE
            )
        )

    def test_feature_names(self):
        self.assertEqual(
            self.capabilities.feature_names,
            (
                "chat",
                "code",
                "vision",
            ),
        )


class TestCapabilityUtils(unittest.TestCase):

    def test_normalize_features(self):
        result = normalize_features(
            [
                ModelFeature.CHAT,
                ModelFeature.CODE,
                ModelFeature.CHAT,
            ]
        )

        self.assertEqual(
            result,
            frozenset(
                {
                    ModelFeature.CHAT,
                    ModelFeature.CODE,
                }
            ),
        )

    def test_normalize_invalid_features(self):
        with self.assertRaises(TypeError):
            normalize_features(
                [
                    ModelFeature.CHAT,
                    "code",
                ]
            )

    def test_capabilities_from_features(self):
        capabilities = capabilities_from_features(
            [
                ModelFeature.CHAT,
                ModelFeature.REASONING,
                ModelFeature.CODE,
            ]
        )

        self.assertTrue(
            capabilities.supports(
                ModelFeature.CHAT
            )
        )
        self.assertTrue(
            capabilities.supports(
                ModelFeature.REASONING
            )
        )
        self.assertTrue(
            capabilities.supports(
                ModelFeature.CODE
            )
        )

    def test_supports_all_utility(self):
        capabilities = capabilities_from_features(
            [
                ModelFeature.CHAT,
                ModelFeature.CODE,
            ]
        )

        self.assertTrue(
            supports_all(
                capabilities,
                [
                    ModelFeature.CHAT,
                    ModelFeature.CODE,
                ],
            )
        )

        self.assertFalse(
            supports_all(
                capabilities,
                [
                    ModelFeature.CHAT,
                    ModelFeature.VISION,
                ],
            )
        )

    def test_supports_any_utility(self):
        capabilities = capabilities_from_features(
            [
                ModelFeature.CHAT,
                ModelFeature.CODE,
            ]
        )

        self.assertTrue(
            supports_any(
                capabilities,
                [
                    ModelFeature.VISION,
                    ModelFeature.CODE,
                ],
            )
        )

        self.assertFalse(
            supports_any(
                capabilities,
                [
                    ModelFeature.VISION,
                    ModelFeature.AUDIO,
                ],
            )
        )

    def test_feature_names_utility(self):
        capabilities = capabilities_from_features(
            [
                ModelFeature.VISION,
                ModelFeature.CHAT,
                ModelFeature.CODE,
            ]
        )

        self.assertEqual(
            feature_names(capabilities),
            (
                "chat",
                "code",
                "vision",
            ),
        )

    def test_invalid_capabilities_argument(self):
        with self.assertRaises(TypeError):
            supports_all(
                "invalid",
                [
                    ModelFeature.CHAT,
                ],
            )

        with self.assertRaises(TypeError):
            supports_any(
                "invalid",
                [
                    ModelFeature.CHAT,
                ],
            )

        with self.assertRaises(TypeError):
            feature_names(
                "invalid",
            )


if __name__ == "__main__":
    unittest.main()
