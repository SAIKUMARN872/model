from enum import Enum


class ProviderTier(str, Enum):
    SLM = "slm"
    MLM = "mlm"
    LLM = "llm"


class ProviderType(str, Enum):
    LLM = "llm"
    VISION = "vision"
    SPEECH = "speech"
    IMAGE_GENERATION = "image_generation"
    RERANKER = "reranker"


class ProviderStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEGRADED = "degraded"
    ERROR = "error"


class ModelCapability(str, Enum):
    CHAT = "chat"
    COMPLETION = "completion"
    REASONING = "reasoning"
    VISION = "vision"
    AUDIO_INPUT = "audio_input"
    AUDIO_OUTPUT = "audio_output"
    IMAGE_GENERATION = "image_generation"
    TOOL_USE = "tool_use"
    JSON_MODE = "json_mode"
    STREAMING = "streaming"
    EMBEDDINGS = "embeddings"
    RERANKING = "reranking"


DEFAULT_TIMEOUT_SECONDS = 60
DEFAULT_MAX_RETRIES = 3
DEFAULT_TEMPERATURE = 0.2

