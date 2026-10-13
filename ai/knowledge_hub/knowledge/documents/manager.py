import json
from pathlib import Path

from ..constants import KNOWLEDGE_DATA_DIR
from ..models import DocumentRecord


class DocumentManager:
    def __init__(self, data_dir: Path | None = None):
        self.data_dir = Path(data_dir or KNOWLEDGE_DATA_DIR)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.path = self.data_dir / "documents.json"

    def list(self, collection_id: str | None = None) -> list[dict]:
        if not self.path.exists():
            return []
        records = json.loads(self.path.read_text(encoding="utf-8"))
        if collection_id is not None:
            records = [
                item for item in records
                if item["collection_id"] == collection_id
            ]
        return records

    def get(self, document_id: str) -> dict | None:
        return next(
            (item for item in self.list()
             if item["document_id"] == document_id),
            None,
        )

    def save(self, record: DocumentRecord) -> dict:
        records = self.list()
        records = [
            item for item in records
            if item["document_id"] != record.document_id
        ]
        from dataclasses import asdict
        records.append(asdict(record))
        self.path.write_text(
            json.dumps(records, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        return asdict(record)

    def delete(self, document_id: str) -> bool:
        records = self.list()
        remaining = [
            item for item in records
            if item["document_id"] != document_id
        ]
        if len(remaining) == len(records):
            return False
        self.path.write_text(
            json.dumps(remaining, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        return True
