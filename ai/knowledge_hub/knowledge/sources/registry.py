import json
from pathlib import Path

from ..constants import KNOWLEDGE_DATA_DIR


class SourceRegistry:
    def __init__(self, data_dir: Path | None = None):
        root = Path(data_dir or KNOWLEDGE_DATA_DIR)
        root.mkdir(parents=True, exist_ok=True)
        self.path = root / "sources.json"

    def list(self, collection_id: str | None = None) -> list[dict]:
        if not self.path.exists():
            return []
        items = json.loads(self.path.read_text(encoding="utf-8"))
        if collection_id is not None:
            items = [
                item for item in items
                if item["collection_id"] == collection_id
            ]
        return items

    def register(self, source: dict) -> dict:
        required = ("source_id", "source_type", "location", "collection_id")
        if any(not source.get(key) for key in required):
            raise ValueError("Source is missing required fields")

        items = self.list()
        if any(x["source_id"] == source["source_id"] for x in items):
            raise ValueError("Source ID already exists")

        items.append(dict(source))
        self.path.write_text(
            json.dumps(items, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        return dict(source)

    def remove(self, source_id: str) -> bool:
        items = self.list()
        remaining = [x for x in items if x["source_id"] != source_id]
        if len(remaining) == len(items):
            return False
        self.path.write_text(
            json.dumps(remaining, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        return True
