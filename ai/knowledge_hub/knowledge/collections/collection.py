from dataclasses import dataclass, field


@dataclass
class KnowledgeCollection:
    collection_id: str
    name: str
    description: str = ""
    metadata: dict = field(default_factory=dict)
