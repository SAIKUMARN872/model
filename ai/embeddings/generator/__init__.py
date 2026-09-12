"""
ModelNow Generator Package.

Provides:
    - prompt encoding
    - text generation
    - streaming
    - batch generation
    - asynchronous generation
    - generation pipelines
"""

from .encoder import (
    EncodedPrompt,
    PromptEncoder,
)

from .generator import (
    GenerationConfig,
    GenerationError,
    GenerationConfigurationError,
    GenerationResult,
    TextGenerator,
)

from .pipeline import (
    GenerationPipeline,
    PipelineConfig,
)

from .utils import (
    batch_items,
    estimate_tokens,
    estimate_tokens_batch,
    extract_text,
    merge_generation_kwargs,
    normalize_text,
    remove_prompt_prefix,
    truncate_text,
    validate_prompt,
    validate_prompts,
)


__all__ = [
    # Encoder
    "PromptEncoder",
    "EncodedPrompt",

    # Generator
    "TextGenerator",
    "GenerationConfig",
    "GenerationResult",
    "GenerationError",
    "GenerationConfigurationError",

    # Pipeline
    "GenerationPipeline",
    "PipelineConfig",

    # Utilities
    "validate_prompt",
    "validate_prompts",
    "normalize_text",
    "estimate_tokens",
    "estimate_tokens_batch",
    "truncate_text",
    "merge_generation_kwargs",
    "extract_text",
    "batch_items",
    "remove_prompt_prefix",
]


__version__ = "1.0.0"