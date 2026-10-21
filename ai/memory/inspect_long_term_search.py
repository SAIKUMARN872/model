from dataclasses import fields, is_dataclass
import inspect

from ai.memory.long_term.memory import LongTermMemory
from ai.memory.long_term.storage import InMemoryLongTermMemoryStore

tenant = "search-debug-tenant"
user = "search-debug-user"

store = InMemoryLongTermMemoryStore()
memory = LongTermMemory(store=store)

saved = memory.save(
    tenant,
    user,
    "ModelNow keeps important architecture decisions in long-term memory",
    category="architecture",
    importance=0.95,
)

print("\n=== SAVED RECORD ===")
print(repr(saved))
print("Saved ID:", saved.memory_id)

results = memory.search(
    tenant,
    user,
    "important architecture decisions",
    limit=10,
)

print("\n=== SEARCH RESULTS ===")
print("Result count:", len(results))

for index, result in enumerate(results, start=1):
    print(f"\nResult {index}:")
    print("Type:", type(result))
    print("Value:", repr(result))

    if is_dataclass(result):
        print("Dataclass fields:", [field.name for field in fields(result)])

    for name in ("memory_id", "record", "memory", "content", "score", "rank"):
        if hasattr(result, name):
            print(f"{name}:", repr(getattr(result, name)))

print("\n=== RETRIEVER ===")
print("Search signature:", inspect.signature(memory.search))
print("Retriever:", repr(memory.retriever))
