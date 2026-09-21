from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CapabilityLimits:
    """
    Operational limits associated with model capabilities.
    """

    context_window: int = 0
    max_output_tokens: int = 0
    max_images: int = 0
    max_audio_seconds: float = 0.0
    max_file_size_mb: float = 0.0
    max_tools: int = 0

    def __post_init__(self) -> None:
        if self.context_window < 0:
            raise ValueError(
                "context_window cannot be negative"
            )

        if self.max_output_tokens < 0:
            raise ValueError(
                "max_output_tokens cannot be negative"
            )

        if self.max_images < 0:
            raise ValueError(
                "max_images cannot be negative"
            )

        if self.max_audio_seconds < 0:
            raise ValueError(
                "max_audio_seconds cannot be negative"
            )

        if self.max_file_size_mb < 0:
            raise ValueError(
                "max_file_size_mb cannot be negative"
            )

        if self.max_tools < 0:
            raise ValueError(
                "max_tools cannot be negative"
            )


__all__ = ["CapabilityLimits"]
