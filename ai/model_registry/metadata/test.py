from __future__ import annotations

import unittest

from ..models import ModelRecord
from .attributes import ModelAttributes
from .metadata import MetadataStore, ModelMetadata
from .tags import merge_tags, normalize_tags
from .utils import (
    filter_by_organization,
    filter_by_tag,
    merge_metadata,
    metadata_key,
)


def make_model(
    provider: str = "openai",
    model_id: str = "test-model",
) -> ModelRecord:
    return ModelRecord(
        provider=provider,
        model_id=model_id,
        display_name="Test Model",
    )


class TestModelAttributes(unittest.TestCase):

    def test_default_attributes(self):
        attributes = ModelAttributes()

        self.assertIsNone(
            attributes.organization
        )
        self.assertIsNone(
            attributes.family
        )
        self.assertEqual(
            attributes.input_modalities,
            (),
        )
        self.assertEqual(
            attributes.output_modalities,
            (),
        )

    def test_custom_attributes(self):
        attributes = ModelAttributes(
            organization="OpenAI",
            family="GPT",
            input_modalities=("text", "image"),
            output_modalities=("text",),
        )

        self.assertEqual(
            attributes.organization,
            "OpenAI",
        )
        self.assertEqual(
            attributes.family,
            "GPT",
        )
        self.assertEqual(
            attributes.input_modalities,
            ("text", "image"),
        )


class TestTags(unittest.TestCase):

    def test_normalize_tags(self):
        result = normalize_tags(
            ["AI", "Reasoning", "Code"]
        )

        self.assertEqual(
            result,
            ("ai", "reasoning", "code"),
        )

    def test_normalize_removes_duplicates(self):
        result = normalize_tags(
            ["AI", "ai", " AI "]
        )

        self.assertEqual(
            result,
            ("ai",),
        )

    def test_normalize_removes_empty_values(self):
        result = normalize_tags(
            ["AI", "", "  ", "Code"]
        )

        self.assertEqual(
            result,
            ("ai", "code"),
        )

    def test_normalize_rejects_non_string(self):
        with self.assertRaises(TypeError):
            normalize_tags(
                ["ai", 123]  # type: ignore[list-item]
            )

    def test_merge_tags(self):
        result = merge_tags(
            ["ai", "code"],
            ["code", "reasoning"],
        )

        self.assertEqual(
            result,
            ("ai", "code", "reasoning"),
        )


class TestModelMetadata(unittest.TestCase):

    def test_from_model(self):
        model = make_model()

        metadata = ModelMetadata.from_model(
            model,
            tags=("AI", "Code"),
            description="Test model",
        )

        self.assertEqual(
            metadata.qualified_id,
            "openai:test-model",
        )
        self.assertEqual(
            metadata.tags,
            ("ai", "code"),
        )
        self.assertEqual(
            metadata.description,
            "Test model",
        )

    def test_from_model_rejects_invalid_model(self):
        with self.assertRaises(TypeError):
            ModelMetadata.from_model(
                "invalid"  # type: ignore[arg-type]
            )

    def test_has_tag(self):
        metadata = ModelMetadata(
            qualified_id="openai:test-model",
            tags=("ai", "code"),
        )

        self.assertTrue(
            metadata.has_tag("AI")
        )
        self.assertTrue(
            metadata.has_tag(" code ")
        )
        self.assertFalse(
            metadata.has_tag("vision")
        )

    def test_with_tags(self):
        metadata = ModelMetadata(
            qualified_id="openai:test-model",
            tags=("ai",),
        )

        updated = metadata.with_tags(
            ("Code", "Reasoning")
        )

        self.assertEqual(
            updated.tags,
            ("code", "reasoning"),
        )
        self.assertEqual(
            updated.qualified_id,
            metadata.qualified_id,
        )


class TestMetadataStore(unittest.TestCase):

    def test_register(self):
        metadata = ModelMetadata(
            qualified_id="openai:test-model"
        )

        store = MetadataStore()

        result = store.register(metadata)

        self.assertEqual(
            result,
            metadata,
        )
        self.assertEqual(
            store.count(),
            1,
        )

    def test_register_duplicate(self):
        metadata = ModelMetadata(
            qualified_id="openai:test-model"
        )

        store = MetadataStore(
            [metadata]
        )

        with self.assertRaises(ValueError):
            store.register(metadata)

    def test_upsert(self):
        first = ModelMetadata(
            qualified_id="openai:test-model",
            description="First",
        )

        second = ModelMetadata(
            qualified_id="openai:test-model",
            description="Second",
        )

        store = MetadataStore(
            [first]
        )

        store.upsert(second)

        self.assertEqual(
            store.count(),
            1,
        )
        self.assertEqual(
            store.get(
                "openai:test-model"
            ).description,
            "Second",
        )

    def test_get_case_insensitive(self):
        metadata = ModelMetadata(
            qualified_id="OpenAI:Test-Model"
        )

        store = MetadataStore(
            [metadata]
        )

        result = store.get(
            "openai:test-model"
        )

        self.assertEqual(
            result,
            metadata,
        )

    def test_get_missing(self):
        store = MetadataStore()

        self.assertIsNone(
            store.get("missing:model")
        )

    def test_list_all(self):
        first = ModelMetadata(
            qualified_id="openai:model-a"
        )
        second = ModelMetadata(
            qualified_id="anthropic:model-b"
        )

        store = MetadataStore(
            [first, second]
        )

        self.assertEqual(
            store.list_all(),
            [first, second],
        )

    def test_remove(self):
        metadata = ModelMetadata(
            qualified_id="openai:test-model"
        )

        store = MetadataStore(
            [metadata]
        )

        removed = store.remove(
            "openai:test-model"
        )

        self.assertEqual(
            removed,
            metadata,
        )
        self.assertEqual(
            store.count(),
            0,
        )

    def test_clear(self):
        store = MetadataStore(
            [
                ModelMetadata(
                    qualified_id="openai:model-a"
                ),
                ModelMetadata(
                    qualified_id="openai:model-b"
                ),
            ]
        )

        store.clear()

        self.assertEqual(
            store.count(),
            0,
        )

    def test_rejects_invalid_metadata(self):
        store = MetadataStore()

        with self.assertRaises(TypeError):
            store.register(
                "invalid"  # type: ignore[arg-type]
            )


class TestMetadataUtils(unittest.TestCase):

    def test_metadata_key_from_model(self):
        model = make_model()

        self.assertEqual(
            metadata_key(model),
            "openai:test-model",
        )

    def test_metadata_key_from_string(self):
        self.assertEqual(
            metadata_key(
                " OpenAI:Test-Model "
            ),
            "openai:test-model",
        )

    def test_metadata_key_rejects_invalid(self):
        with self.assertRaises(TypeError):
            metadata_key(123)  # type: ignore[arg-type]

    def test_filter_by_tag(self):
        first = ModelMetadata(
            qualified_id="openai:model-a",
            tags=("ai", "code"),
        )

        second = ModelMetadata(
            qualified_id="openai:model-b",
            tags=("vision",),
        )

        result = filter_by_tag(
            [first, second],
            "CODE",
        )

        self.assertEqual(
            result,
            [first],
        )

    def test_filter_by_organization(self):
        first = ModelMetadata(
            qualified_id="openai:model-a",
            attributes=ModelAttributes(
                organization="OpenAI"
            ),
        )

        second = ModelMetadata(
            qualified_id="anthropic:model-b",
            attributes=ModelAttributes(
                organization="Anthropic"
            ),
        )

        result = filter_by_organization(
            [first, second],
            "openai",
        )

        self.assertEqual(
            result,
            [first],
        )

    def test_merge_metadata(self):
        base = ModelMetadata(
            qualified_id="openai:test-model",
            tags=("ai",),
            description="Base description",
            metadata={
                "source": "base",
                "version": 1,
            },
        )

        override = ModelMetadata(
            qualified_id="openai:test-model",
            tags=("code",),
            description="Updated description",
            metadata={
                "version": 2,
            },
        )

        result = merge_metadata(
            base,
            override,
        )

        self.assertEqual(
            result.description,
            "Updated description",
        )
        self.assertEqual(
            result.tags,
            ("code",),
        )
        self.assertEqual(
            result.metadata,
            {
                "source": "base",
                "version": 2,
            },
        )

    def test_merge_metadata_rejects_different_models(self):
        base = ModelMetadata(
            qualified_id="openai:model-a"
        )

        override = ModelMetadata(
            qualified_id="openai:model-b"
        )

        with self.assertRaises(ValueError):
            merge_metadata(
                base,
                override,
            )


if __name__ == "__main__":
    unittest.main()
