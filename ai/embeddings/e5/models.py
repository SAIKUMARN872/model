from dataclasses import dataclass

DEFAULT_MODEL = "intfloat/e5-small-v2"
DEFAULT_BATCH_SIZE = 32
MAX_BATCH_SIZE = 512
DEFAULT_NORMALIZE = True
DEFAULT_MAX_SEQUENCE_LENGTH = 512

MODEL_DIMENSIONS = {
    "intfloat/e5-small-v2": 384,
    "intfloat/e5-base-v2": 768,
    "intfloat/e5-large-v2": 1024,
}


@dataclass(frozen=True)
class E5ModelConfig:
    model_name: str = DEFAULT_MODEL
    batch_size: int = DEFAULT_BATCH_SIZE
    normalize_embeddings: bool = DEFAULT_NORMALIZE
    device: str | None = None
    max_sequence_length: int = DEFAULT_MAX_SEQUENCE_LENGTH
    trust_remote_code: bool = False

    def __post_init__(self):
        if not isinstance(self.model_name, str) or not self.model_name.strip():
            raise ValueError("model_name must be non-empty.")
        if isinstance(self.batch_size, bool) or not isinstance(self.batch_size, int):
            raise ValueError("batch_size must be an integer.")
        if not 1 <= self.batch_size <= MAX_BATCH_SIZE:
            raise ValueError(f"batch_size must be between 1 and {MAX_BATCH_SIZE}.")
        if isinstance(self.max_sequence_length, bool) or not isinstance(self.max_sequence_length, int) or self.max_sequence_length < 1:
            raise ValueError("max_sequence_length must be a positive integer.")
        if not isinstance(self.normalize_embeddings, bool):
            raise ValueError("normalize_embeddings must be boolean.")
        if not isinstance(self.trust_remote_code, bool):
            raise ValueError("trust_remote_code must be boolean.")


@dataclass(frozen=True)
class E5ModelInfo:
    model_name: str
    dimension: int | None
    batch_size: int
    max_sequence_length: int
    normalized: bool
    device: str | None
    loaded: bool
