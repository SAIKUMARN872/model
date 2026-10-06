from __future__ import annotations

from ai.routing_engine.models import RoutingRequest

from .features import RequestFeatures, extract_features
from .intent import (
    ReasoningLevel,
    TaskComplexity,
    TaskProfile,
    TaskType,
)


class RequestClassifier:
    """
    Deterministic v1 request classifier.

    The classifier is intentionally lightweight and does not call an LLM.
    It creates a task profile that can later be consumed by the policy router
    and model selector.
    """

    def classify(self, request: RoutingRequest) -> TaskProfile:
        text = self._request_text(request)
        features = extract_features(text)

        task_type = self._classify_task_type(features)
        complexity = self._classify_complexity(
            features,
            request,
        )

        reasoning_level = self._classify_reasoning(
            features,
            complexity,
        )

        required_capabilities = self._required_capabilities(
            request,
            features,
        )

        quality_sensitive = (
            request.min_quality is not None
            or complexity == TaskComplexity.HIGH
            or reasoning_level == ReasoningLevel.HIGH
        )

        cost_sensitive = (
            request.max_cost is not None
        )

        latency_sensitive = (
            request.max_latency_ms is not None
        )

        metadata = {
            "classifier_version": "v1",
            "text_length": features.text_length,
            "estimated_input_tokens": features.estimated_tokens,
        }

        return TaskProfile(
            task_type=task_type,
            complexity=complexity,
            reasoning_level=reasoning_level,
            code_required=features.has_code_keywords,
            vision_required=self._has_capability(
                request,
                "vision",
            ),
            audio_required=self._has_capability(
                request,
                "audio",
            ),
            tool_use_required=(
                features.has_tool_keywords
                or self._has_capability(request, "tool_use")
            ),
            agentic_required=(
                features.has_agentic_keywords
                or self._has_capability(request, "agentic")
            ),
            context_size=features.text_length,
            estimated_input_tokens=features.estimated_tokens,
            latency_sensitive=latency_sensitive,
            quality_sensitive=quality_sensitive,
            cost_sensitive=cost_sensitive,
            streaming_required=request.stream,
            preferred_tier=request.preferred_tier,
            required_capabilities=required_capabilities,
            confidence=self._confidence(features),
            metadata=metadata,
        )

    @staticmethod
    def _request_text(request: RoutingRequest) -> str:
        parts: list[str] = []

        for message in request.messages:
            content = message.get("content")

            if isinstance(content, str):
                parts.append(content)

        return "\n".join(parts)

    @staticmethod
    def _classify_task_type(
        features: RequestFeatures,
    ) -> TaskType:
        if features.has_agentic_keywords:
            return TaskType.AGENTIC

        if features.has_tool_keywords:
            return TaskType.TOOL_USE

        if features.has_code_keywords:
            return TaskType.CODING

        if features.has_summary_keywords:
            return TaskType.SUMMARIZATION

        if features.has_translation_keywords:
            return TaskType.TRANSLATION

        if features.has_extraction_keywords:
            return TaskType.EXTRACTION

        if features.has_analysis_keywords:
            return TaskType.ANALYSIS

        if features.has_reasoning_keywords:
            return TaskType.REASONING

        if features.has_writing_keywords:
            return TaskType.WRITING

        return TaskType.GENERAL

    @staticmethod
    def _classify_complexity(
        features: RequestFeatures,
        request: RoutingRequest,
    ) -> TaskComplexity:
        if request.min_quality is not None and request.min_quality >= 0.9:
            return TaskComplexity.HIGH

        if features.estimated_tokens > 4000:
            return TaskComplexity.HIGH

        if features.estimated_tokens > 1000:
            return TaskComplexity.MEDIUM

        keyword_count = sum(
            [
                features.has_code_keywords,
                features.has_reasoning_keywords,
                features.has_analysis_keywords,
                features.has_tool_keywords,
                features.has_agentic_keywords,
            ]
        )

        if keyword_count >= 2:
            return TaskComplexity.HIGH

        if keyword_count == 1:
            return TaskComplexity.MEDIUM

        return TaskComplexity.LOW

    @staticmethod
    def _classify_reasoning(
        features: RequestFeatures,
        complexity: TaskComplexity,
    ) -> ReasoningLevel:
        if features.has_reasoning_keywords:
            return ReasoningLevel.HIGH

        if features.has_analysis_keywords:
            return ReasoningLevel.MEDIUM

        if complexity == TaskComplexity.HIGH:
            return ReasoningLevel.MEDIUM

        return ReasoningLevel.LOW

    @staticmethod
    def _required_capabilities(
        request: RoutingRequest,
        features: RequestFeatures,
    ) -> tuple[str, ...]:
        capabilities = set(request.required_capabilities)

        if features.has_code_keywords:
            capabilities.add("code")

        if features.has_tool_keywords:
            capabilities.add("tool_use")

        if features.has_agentic_keywords:
            capabilities.add("agentic")

        if request.stream:
            capabilities.add("streaming")

        return tuple(sorted(capabilities))

    @staticmethod
    def _has_capability(
        request: RoutingRequest,
        capability: str,
    ) -> bool:
        return capability in request.required_capabilities

    @staticmethod
    def _confidence(features: RequestFeatures) -> float:
        signals = sum(
            [
                features.has_code_keywords,
                features.has_reasoning_keywords,
                features.has_writing_keywords,
                features.has_summary_keywords,
                features.has_extraction_keywords,
                features.has_translation_keywords,
                features.has_analysis_keywords,
                features.has_tool_keywords,
                features.has_agentic_keywords,
            ]
        )

        if signals >= 2:
            return 0.95

        if signals == 1:
            return 0.85

        return 0.65


__all__ = ["RequestClassifier"]
