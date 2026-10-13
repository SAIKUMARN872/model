from ai.memory.manager import (
    MemoryManager,
    MemoryContext,
    ShortTermMemoryBackend,
    LongTermMemoryBackend,
    SemanticMemoryBackend,
)


def check(condition, message):
    if not condition:
        raise AssertionError(message)
    print(f"PASS: {message}")


backends = [
    ShortTermMemoryBackend(),
    LongTermMemoryBackend(),
    SemanticMemoryBackend(),
]
manager = MemoryManager(backends=backends)

context = MemoryContext(
    tenant_id="integration-tenant",
    user_id="integration-user",
)
other_user = MemoryContext(
    tenant_id="integration-tenant",
    user_id="different-user",
)
other_tenant = MemoryContext(
    tenant_id="different-tenant",
    user_id="integration-user",
)

check(
    set(manager.backend_names()) == {
        "short_term", "long_term", "semantic"
    },
    "All three adapters registered",
)

content = "ModelNow integration test remembers routing preferences"
saved = manager.remember(
    context,
    content,
    category="integration",
    metadata={"test": True},
)

expected_backends = {"short_term", "long_term", "semantic"}
check(
    expected_backends.issubset(saved.keys()),
    "All three backends accepted the write",
)

results = manager.recall(
    context,
    "routing preferences",
    limit=10,
)
check(
    expected_backends.issubset({item.backend for item in results}),
    "All three backends returned matching memories",
)

user_results = manager.recall(
    other_user,
    "routing preferences",
    limit=10,
)
check(not user_results, "Different user cannot retrieve these memories")

tenant_results = manager.recall(
    other_tenant,
    "routing preferences",
    limit=10,
)
check(not tenant_results, "Different tenant cannot retrieve these memories")

for backend_name in sorted(expected_backends):
    memory_id = saved[backend_name]
    deleted = manager.forget(
        context,
        memory_id,
        backend=backend_name,
    )
    check(deleted, f"{backend_name}: forget reports deletion")

    remaining = manager.recall(
        context,
        "routing preferences",
        limit=10,
        backends=[backend_name],
    )
    check(
        all(item.memory_id != memory_id for item in remaining),
        f"{backend_name}: deleted memory is absent from recall",
    )

print("\nALL ADAPTER INTEGRATION CHECKS PASSED")
