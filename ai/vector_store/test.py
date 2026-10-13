"""Consolidated offline tests for ModelNow vector-store components."""

from ai.vector_store.engine_test import run_tests as run_engine_tests
from ai.vector_store.search.test import run_tests as run_search_tests
from ai.vector_store.collections.test import main as run_collection_tests


def main() -> None:
    print("\n========== VECTOR STORE ENGINE ==========")
    run_engine_tests()

    print("\n========== VECTOR STORE SEARCH ==========")
    run_search_tests()

    print("\n========== VECTOR STORE COLLECTIONS ==========")
    run_collection_tests()

    print("\nMODELNOW VECTOR STORE CONSOLIDATED TEST: PASS")


if __name__ == "__main__":
    main()
