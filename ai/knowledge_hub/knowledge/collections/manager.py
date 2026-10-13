import json
from pathlib import Path

from ..constants import KNOWLEDGE_DATA_DIR


class CollectionManager:
    def __init__(self, data_dir: Path | None = None):
        root = Path(data_dir or KNOWLEDGE_DATA_DIR)
        root.mkdir(parents=True, exist_ok=True)
        self.path = root / "collections.json"
        if not self.path.exists():
            self.path.write_text(
                json.dumps([{
                    "collection_id": "default",
                    "name": "My Knowledge",
                    "description": "Default personal knowledge collection",
                    "metadata": {},
                }], indent=2),
                encoding="utf-8",
            )

    def list(self) -> list[dict]:
        return json.loads(self.path.read_text(encoding="utf-8"))

    def get(self, collection_id: str) -> dict | None:
        return next(
            (item for item in self.list()
             if item["collection_id"] == collection_id),
            None,
        )

    def create(
        self, collection_id: str, name: str, description: str = ""
    ) -> dict:
        if self.get(collection_id):
            raise ValueError(f"Collection already exists: {collection_id}")
        record = {
            "collection_id": collection_id,
            "name": name,
            "description": description,
            "metadata": {},
        }
        records = self.list()
        records.append(record)
        self.path.write_text(
            json.dumps(records, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        return record
