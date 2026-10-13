from dataclasses import dataclass, field


@dataclass
class KnowledgeSource:
    source_id: str
    source_type: str
    location: str
    collection_id: str = "default"
    enabled: bool = True
    metadata: dict = field(default_factory=dict)
