from __future__ import annotations

from ai.inference_engine.session_manager import (
    SessionContext,
    SessionHistory,
    SessionManager,
)
from ai.inference_engine.session_manager.utils import (
    normalize_session_id,
)


def main() -> None:
    context = SessionContext(
        session_id="test-session",
        model="mock-model",
        metadata={"source": "local-test"},
    )

    assert context.session_id == "test-session"
    assert context.model == "mock-model"
    assert context.metadata["source"] == "local-test"

    context.update(
        model="updated-model",
        metadata={"environment": "test"},
    )

    assert context.model == "updated-model"
    assert context.metadata["environment"] == "test"

    print("SESSION CONTEXT: PASS")

    history = SessionHistory()

    history.add_message(
        {
            "role": "user",
            "content": "Hello",
        }
    )

    history.add_messages(
        [
            {
                "role": "assistant",
                "content": "Hi",
            },
            {
                "role": "user",
                "content": "How are you?",
            },
        ]
    )

    assert history.count == 3
    assert history.get_messages()[0]["content"] == "Hello"

    print("SESSION HISTORY: PASS")

    manager = SessionManager()

    created = manager.create(
        "session-1",
        model="mock-model",
        metadata={"source": "local-test"},
    )

    assert created.session_id == "session-1"
    assert manager.exists("session-1")

    manager.add_message(
        "session-1",
        {
            "role": "user",
            "content": "Test request",
        },
    )

    manager.add_message(
        "session-1",
        {
            "role": "assistant",
            "content": "Test response",
        },
    )

    assert manager.get_history("session-1").count == 2

    manager.update_context(
        "session-1",
        model="updated-model",
    )

    assert manager.get_context(
        "session-1"
    ).model == "updated-model"

    print("SESSION MANAGEMENT: PASS")

    normalized = normalize_session_id(
        "  session-2  "
    )

    assert normalized == "session-2"

    try:
        normalize_session_id("   ")
    except ValueError:
        pass
    else:
        raise AssertionError(
            "Empty session ID should be rejected."
        )

    print("SESSION UTILS: PASS")

    manager.delete("session-1")

    assert not manager.exists("session-1")

    print("SESSION DELETION: PASS")
    print("SESSION MANAGER TEST: PASS")


if __name__ == "__main__":
    main()
