"""Consolidated tests for ModelNow shared collection management."""

from ai.vector_store.collections import (
    CollectionManager,
    collection_key,
    merge_metadata,
    metadata_from_json,
    metadata_to_json,
    validate_collection_name,
    validate_dimension,
    validate_metadata,
)


def main() -> None:
    assert validate_collection_name("knowledge-base") == "knowledge-base"
    assert validate_dimension(384) == 384
    assert validate_metadata({"owner": "modelnow", "active": True})["active"]
    print("PASS: collection name, dimension, and metadata validation")

    assert collection_key("knowledge-base") == collection_key("knowledge-base")
    print("PASS: stable collection key")

    merged = merge_metadata({"owner": "modelnow"}, {"version": 1})
    assert merged == {"owner": "modelnow", "version": 1}
    print("PASS: metadata merge")

    serialized = metadata_to_json(merged)
    assert metadata_from_json(serialized) == merged
    print("PASS: metadata JSON serialization")

    try:
        validate_collection_name("../unsafe")
    except ValueError:
        pass
    else:
        raise AssertionError("Unsafe collection name was accepted")

    try:
        validate_dimension(0)
    except ValueError:
        pass
    else:
        raise AssertionError("Invalid dimension was accepted")
    print("PASS: invalid inputs rejected")

    print("MODELNOW COLLECTION UTILITIES TEST: PASS")


if __name__ == "__main__":
    main()
