from dataclasses import dataclass


DEFAULT_BGE_MODEL = "BAAI/bge-small-en-v1.5"
DEFAULT_BGE_DIMENSION = 384
DEFAULT_BGE_BATCH_SIZE = 32
DEFAULT_BGE_MAX_SEQUENCE_LENGTH = 512

# BGE v1.5 recommends this instruction for retrieval queries.
BGE_QUERY_INSTRUCTION = (
    "Represent this sentence for searching relevant passages: "
)


@dataclass(frozen=True, slots=True)
class BGEModelInfo:
    name: str = DEFAULT_BGE_MODEL
    provider: str = "sentence-transformers"
    dimension: int = DEFAULT_BGE_DIMENSION
    max_sequence_length: int = DEFAULT_BGE_MAX_SEQUENCE_LENGTH
    normalized_by_default: bool = False
