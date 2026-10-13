"""Consolidated tests for ModelNow vector-store management."""

from ai.vector_store.manager import (
    VectorStoreFactory,
    VectorStoreManager,
    VectorStoreRegistry,
    validate_backend_name,
    validate_store_name,
)


class MockStore:
    def __init__(self, label="mock"):
        self.label = label


def main() -> None:
    assert validate_backend_name(" FAISS ") == "faiss"
    assert validate_backend_name("Chroma") == "chroma"
    assert validate_store_name("knowledge_store") == "knowledge_store"
    print("PASS: backend and store-name validation")

    try:
        validate_backend_name("unknown")
    except ValueError:
        pass
    else:
        raise AssertionError("Unknown backend was accepted")
    print("PASS: unsupported backend rejection")

    factory = VectorStoreFactory()
    factory.register("faiss", MockStore)
    store = factory.create("faiss", label="test-faiss")
    assert store.label == "test-faiss"
    assert factory.registered_backends() == ("faiss",)

    try:
        factory.register("faiss", MockStore)
    except ValueError:
        pass
    else:
        raise AssertionError("Duplicate factory registration was accepted")
    print("PASS: factory registration and construction")

    registry = VectorStoreRegistry()
    first = MockStore("first")
    registry.register("primary", first)
    assert registry.get("primary") is first
    assert registry.contains("primary")
    assert registry.list_names() == ("primary",)

    try:
        registry.register("primary", MockStore())
    except ValueError:
        pass
    else:
        raise AssertionError("Duplicate registry entry was accepted")
    print("PASS: registry lifecycle and duplicate protection")

    manager = VectorStoreManager()
    manager.register_backend("chroma", MockStore)
    managed = manager.create_store(
        "knowledge",
        "chroma",
        label="managed-chroma",
    )
    assert manager.get_store("knowledge") is managed
    assert managed.label == "managed-chroma"
    assert manager.get_backend_name("knowledge") == "chroma"
    assert manager.list_stores() == [
        {"name": "knowledge", "backend": "chroma"}
    ]
    print("PASS: manager creation, lookup, and listing")

    replacement = manager.create_store(
        "knowledge",
        "chroma",
        replace=True,
        label="replacement",
    )
    assert manager.get_store("knowledge") is replacement
    assert replacement.label == "replacement"
    print("PASS: explicit store replacement")

    removed = manager.remove_store("knowledge")
    assert removed is replacement
    assert manager.list_stores() == []

    try:
        manager.get_store("knowledge")
    except LookupError:
        pass
    else:
        raise AssertionError("Removed store was still accessible")
    print("PASS: removal and missing-store handling")

    manager.register_store("external", MockStore("external"))
    manager.clear_registry()
    assert manager.list_stores() == []
    print("PASS: registry cleanup")

    print("MODELNOW VECTOR STORE MANAGER CONSOLIDATED TEST: PASS")


if __name__ == "__main__":
    main()
