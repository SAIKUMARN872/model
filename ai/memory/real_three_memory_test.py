import tempfile

from ai.memory.short_term.manager import ShortTermMemoryManager
from ai.memory.long_term.memory import LongTermMemory
from ai.memory.long_term.storage import InMemoryLongTermMemoryStore
from ai.memory.semantic.memory import SemanticMemory


TENANT = "live-test-tenant"
USER = "live-test-user"
OTHER_USER = "another-user"
passed = 0


def check(condition, message):
    global passed
    if not condition:
        raise AssertionError("FAIL: " + message)
    passed += 1
    print("PASS:", message)


print("\n=== MODELNOW THREE-MEMORY REAL-OPERATION TEST ===")

# 1. Short-term memory
short = ShortTermMemoryManager(max_items=100, default_ttl_seconds=None)

item = short.remember(
    TENANT, USER,
    "ModelNow uses short-term memory for recent conversation context",
    category="architecture",
    metadata={"test": "live"},
)
check(bool(item.memory_id), "Short-term memory saved")

found = short.recall(
    TENANT, USER, query="recent conversation context", limit=10
)
check(any(x.memory_id == item.memory_id for x in found),
      "Short-term memory recalled by query")

other = short.recall(
    TENANT, OTHER_USER, query="recent conversation context", limit=10
)
check(not any(x.memory_id == item.memory_id for x in other),
      "Short-term memory isolated by user")

check(short.forget(TENANT, USER, item.memory_id),
      "Short-term memory forgotten")


# 2. Long-term memory
store = InMemoryLongTermMemoryStore()
long_term = LongTermMemory(store=store)

item = long_term.save(
    TENANT, USER,
    "ModelNow keeps important architecture decisions in long-term memory",
    category="architecture",
    importance=0.95,
    metadata={"test": "live"},
)
check(bool(item.memory_id), "Long-term memory saved")

loaded = long_term.get(TENANT, USER, item.memory_id)
check(loaded is not None, "Long-term memory retrieved by ID")

found = long_term.search(
    TENANT, USER, "important architecture decisions", limit=10
)
check(any(
    getattr(getattr(result, "record", None), "memory_id", None)
       == item.memory_id
    for result in found
), "Long-term memory search returns saved record")

other = long_term.list(TENANT, OTHER_USER, limit=100)
check(not any(x.memory_id == item.memory_id for x in other),
      "Long-term memory isolated by user")

check(long_term.delete(TENANT, USER, item.memory_id),
      "Long-term memory deleted")


# 3. Semantic memory
semantic = SemanticMemory()

item = semantic.add(
    TENANT, USER,
    "ModelNow selects AI models according to cost latency and quality",
    category="architecture",
    confidence=0.95,
    source="live-test",
    metadata={"test": "live"},
    deduplicate=False,
)
check(bool(item.knowledge_id), "Semantic knowledge added")

loaded = semantic.get(TENANT, USER, item.knowledge_id)
check(loaded is not None, "Semantic knowledge retrieved by ID")

found = semantic.list(TENANT, USER, category="architecture", limit=100)
check(any(x.knowledge_id == item.knowledge_id for x in found),
      "Semantic knowledge appears in category listing")

other = semantic.list(TENANT, OTHER_USER, limit=100)
check(not any(x.knowledge_id == item.knowledge_id for x in other),
      "Semantic knowledge isolated by user")

check(semantic.delete(TENANT, USER, item.knowledge_id),
      "Semantic knowledge deleted")

check(semantic.get(TENANT, USER, item.knowledge_id) is None,
      "Deleted semantic knowledge is absent")

print(f"\nALL {passed} REAL-OPERATION CHECKS PASSED")

