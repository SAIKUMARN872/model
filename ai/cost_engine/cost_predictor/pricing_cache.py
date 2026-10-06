from dataclasses import dataclass
from time import monotonic

@dataclass
class PricingCacheEntry:
    pricing: dict
    expires_at: float

class PricingCache:
    def __init__(self, ttl_seconds: float = 300.0):
        self.ttl_seconds = ttl_seconds
        self._items: dict[str, PricingCacheEntry] = {}

    def get(self, key: str):
        item = self._items.get(key)
        if item is None or monotonic() >= item.expires_at:
            self._items.pop(key, None)
            return None
        return item.pricing

    def set(self, key: str, pricing: dict) -> None:
        self._items[key] = PricingCacheEntry(pricing, monotonic() + self.ttl_seconds)
