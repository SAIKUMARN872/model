"""Real-operation tests for ModelNow prompt history."""

from datetime import datetime, timedelta, timezone

from ai.prompt_management.history import (
    InMemoryHistoryStorage,
    PromptHistory,
    PromptHistoryAnalytics,
)


passed = 0
failed = 0


def check(name, operation):
    global passed, failed
    try:
        operation()
        passed += 1
        print(f"PASS: {name}")
    except Exception as exc:
        failed += 1
        print(f"FAIL: {name}")
        print(f"      {type(exc).__name__}: {exc}")


def expect_error(error_type, operation):
    try:
        operation()
    except error_type:
        return
    except Exception as exc:
        raise AssertionError(
            f"Expected {error_type.__name__}, got {type(exc).__name__}: {exc}"
        ) from exc
    raise AssertionError(f"Expected {error_type.__name__}, but no error occurred.")


def new_history():
    return PromptHistory(InMemoryHistoryStorage())


def test_record_and_retrieve():
    history = new_history()
    event = history.record(
        "tenant-a",
        "prompt-1",
        "created",
        {"source": "real-operation-test"},
    )
    saved = history.get("tenant-a", event.event_id)

    assert saved.event_id == event.event_id
    assert saved.tenant_id == "tenant-a"
    assert saved.prompt_id == "prompt-1"
    assert saved.event_type == "created"
    assert saved.metadata["source"] == "real-operation-test"
    assert saved.timestamp.tzinfo is not None


def test_list_events_by_tenant():
    history = new_history()
    history.record("tenant-a", "p1", "created")
    history.record("tenant-b", "p2", "created")

    events = history.list_events("tenant-a")
    assert len(events) == 1
    assert events[0].prompt_id == "p1"
    assert all(event.tenant_id == "tenant-a" for event in events)


def test_filter_by_prompt_and_type():
    history = new_history()
    history.record("tenant-a", "p1", "created")
    history.record("tenant-a", "p1", "rendered")
    history.record("tenant-a", "p2", "created")

    events = history.list_events(
        "tenant-a",
        prompt_id="p1",
        event_type="rendered",
    )
    assert len(events) == 1
    assert events[0].event_type == "rendered"


def test_limit_returns_requested_number():
    history = new_history()
    for index in range(4):
        history.record("tenant-a", "p1", "rendered", {"index": index})

    assert len(history.list_events("tenant-a", limit=2)) == 2


def test_events_are_ordered_by_timestamp():
    history = new_history()
    now = datetime.now(timezone.utc)
    history.record("tenant-a", "p1", "later", timestamp=now + timedelta(seconds=5))
    history.record("tenant-a", "p1", "earlier", timestamp=now)

    events = history.list_events("tenant-a")
    assert [event.event_type for event in events] == ["earlier", "later"]


def test_time_range_filter():
    history = new_history()
    now = datetime.now(timezone.utc)
    history.record("tenant-a", "p1", "before", timestamp=now - timedelta(days=1))
    history.record("tenant-a", "p1", "inside", timestamp=now)
    history.record("tenant-a", "p1", "after", timestamp=now + timedelta(days=1))

    events = history.list_events(
        "tenant-a",
        since=now - timedelta(hours=1),
        until=now + timedelta(hours=1),
    )
    assert [event.event_type for event in events] == ["inside"]


def test_cross_tenant_event_read_rejected():
    history = new_history()
    event = history.record("tenant-a", "p1", "created")

    expect_error(KeyError, lambda: history.get("tenant-b", event.event_id))


def test_metadata_is_defensively_copied():
    history = new_history()
    source = {"details": {"status": "original"}}
    event = history.record("tenant-a", "p1", "created", source)
    source["details"]["status"] = "changed"

    retrieved = history.get("tenant-a", event.event_id)
    assert retrieved.metadata["details"]["status"] == "original"


def test_retrieved_metadata_is_defensively_copied():
    history = new_history()
    event = history.record("tenant-a", "p1", "created", {"value": "original"})
    retrieved = history.get("tenant-a", event.event_id)
    retrieved.metadata["value"] = "modified"

    saved = history.get("tenant-a", event.event_id)
    assert saved.metadata["value"] == "original"


def test_analytics_use_saved_events():
    history = new_history()
    history.record("tenant-a", "p1", "created")
    history.record("tenant-a", "p1", "rendered")
    history.record("tenant-a", "p1", "rendered")
    history.record("tenant-a", "p2", "created")
    analytics = PromptHistoryAnalytics(history)

    result = analytics.summary("tenant-a")
    assert result["total_events"] == 4
    assert result["unique_prompts"] == 2
    assert result["event_counts"] == {"created": 2, "rendered": 2}
    assert result["prompt_counts"] == {"p1": 3, "p2": 1}


def test_analytics_are_tenant_isolated():
    history = new_history()
    history.record("tenant-a", "p1", "created")
    history.record("tenant-b", "p2", "rendered")

    result = PromptHistoryAnalytics(history).summary("tenant-a")
    assert result["total_events"] == 1
    assert result["prompt_counts"] == {"p1": 1}


def test_most_active_prompts_ranking():
    history = new_history()
    history.record("tenant-a", "p1", "rendered")
    history.record("tenant-a", "p2", "rendered")
    history.record("tenant-a", "p2", "rendered")
    history.record("tenant-a", "p2", "rendered")

    ranking = PromptHistoryAnalytics(history).most_active_prompts("tenant-a")
    assert ranking[0] == {"prompt_id": "p2", "event_count": 3}
    assert ranking[1] == {"prompt_id": "p1", "event_count": 1}


def test_delete_prompt_history():
    history = new_history()
    history.record("tenant-a", "p1", "created")
    history.record("tenant-a", "p1", "rendered")
    history.record("tenant-a", "p2", "created")

    deleted = history.delete_prompt_history("tenant-a", "p1")
    assert deleted == 2
    assert history.list_events("tenant-a", prompt_id="p1") == []
    assert len(history.list_events("tenant-a", prompt_id="p2")) == 1


def test_delete_does_not_affect_other_tenants():
    history = new_history()
    history.record("tenant-a", "p1", "created")
    history.record("tenant-b", "p1", "created")

    history.delete_prompt_history("tenant-a", "p1")
    assert len(history.list_events("tenant-b", prompt_id="p1")) == 1


def test_invalid_metadata_rejected():
    history = new_history()
    expect_error(
        ValueError,
        lambda: history.record("tenant-a", "p1", "created", {"bad": object()}),
    )


def test_empty_identifier_rejected():
    history = new_history()
    expect_error(ValueError, lambda: history.record("", "p1", "created"))


def test_invalid_limit_rejected():
    history = new_history()
    expect_error(ValueError, lambda: history.list_events("tenant-a", limit=0))


def test_naive_datetime_rejected():
    history = new_history()
    expect_error(
        ValueError,
        lambda: history.record(
            "tenant-a",
            "p1",
            "created",
            timestamp=datetime(2026, 1, 1),
        ),
    )


def test_invalid_time_range_rejected():
    history = new_history()
    now = datetime.now(timezone.utc)

    expect_error(
        ValueError,
        lambda: history.list_events(
            "tenant-a",
            since=now + timedelta(days=1),
            until=now,
        ),
    )


def main():
    checks = [
        ("Record and retrieve a saved event", test_record_and_retrieve),
        ("List events with tenant isolation", test_list_events_by_tenant),
        ("Filter by prompt and event type", test_filter_by_prompt_and_type),
        ("Limit returned events", test_limit_returns_requested_number),
        ("Sort events by timestamp", test_events_are_ordered_by_timestamp),
        ("Filter events by time range", test_time_range_filter),
        ("Reject cross-tenant event reads", test_cross_tenant_event_read_rejected),
        ("Copy input metadata defensively", test_metadata_is_defensively_copied),
        ("Protect stored metadata from returned-object changes",
         test_retrieved_metadata_is_defensively_copied),
        ("Calculate analytics from saved events", test_analytics_use_saved_events),
        ("Keep analytics tenant-isolated", test_analytics_are_tenant_isolated),
        ("Rank prompts by actual event counts", test_most_active_prompts_ranking),
        ("Delete history for a specific prompt", test_delete_prompt_history),
        ("Preserve other tenants' history on deletion",
         test_delete_does_not_affect_other_tenants),
        ("Reject non-JSON-compatible metadata", test_invalid_metadata_rejected),
        ("Reject empty identifiers", test_empty_identifier_rejected),
        ("Reject invalid limits", test_invalid_limit_rejected),
        ("Reject naive timestamps", test_naive_datetime_rejected),
        ("Reject invalid time ranges", test_invalid_time_range_rejected),
    ]

    global passed, failed
    print("=" * 68)
    print("MODELNOW PROMPT HISTORY REAL-OPERATION TEST")
    print("=" * 68)

    for name, operation in checks:
        check(name, operation)

    print("=" * 68)
    print(f"REAL-OPERATION CHECKS PASSED: {passed}/{len(checks)}")
    print(f"REAL-OPERATION CHECKS FAILED: {failed}/{len(checks)}")

    if failed:
        print("PROMPT HISTORY REAL-OPERATION TEST: FAIL")
        raise SystemExit(1)

    print("PROMPT HISTORY REAL-OPERATION TEST: PASS")


if __name__ == "__main__":
    main()
