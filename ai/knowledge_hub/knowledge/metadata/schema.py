from dataclasses import dataclass, field
from typing import Any


@dataclass
class KnowledgeMetadata:
    document_id: str
    filename: str
    collection_id: str
    content_type: str = "text/plain"
    attributes: dict[str, Any] = field(default_factory=dict)
