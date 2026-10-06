"""Routing engine smoke tests."""

from ai.routing_engine.engine import RoutingEngine


def test_engine_import() -> None:
    engine = RoutingEngine()
    assert engine is not None


if __name__ == "__main__":
    test_engine_import()
    print("routing_engine test: PASS")
