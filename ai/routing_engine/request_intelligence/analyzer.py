"""Automatic request intelligence for ModelNow routing."""

from __future__ import annotations

import re

from .models import RoutingRequirements


class RequestIntelligenceAnalyzer:
    """Analyze prompts and context to derive routing requirements."""

    _CODING_TERMS = (
        "python",
        "javascript",
        "typescript",
        "java",
        "c++",
        "code",
        "coding",
        "program",
        "function",
        "api",
        "sql",
        "debug",
        "bug",
        "algorithm",
        "repository",
        "software",
    )

    _REASONING_TERMS = (
        "why",
        "analyze",
        "analysis",
        "compare",
        "evaluate",
        "architecture",
        "design",
        "strategy",
        "trade-off",
        "tradeoff",
        "reasoning",
        "derive",
        "prove",
        "optimize",
    )

    _AGENTIC_TERMS = (
        "agent",
        "agents",
        "workflow",
        "tool execution",
        "tool use",
        "browser automation",
        "computer use",
        "execute",
        "automation",
        "autonomous",
    )

    _LONG_CONTEXT_TERMS = (
        "long document",
        "large document",
        "large context",
        "long context",
        "200 pages",
        "500 pages",
        "1000 pages",
        "entire repository",
        "entire codebase",
        "full codebase",
        "full document",
    )

    _HIGH_QUALITY_TERMS = (
        "enterprise",
        "production",
        "critical",
        "high quality",
        "accurate",
        "deep",
        "complex",
        "comprehensive",
        "security",
        "governance",
        "distributed",
    )

    _LOW_COST_TERMS = (
        "cheap",
        "cheapest",
        "low cost",
        "lowest cost",
        "budget",
        "save money",
        "cost effective",
        "cost-efficient",
    )

    _LOW_LATENCY_TERMS = (
        "fast",
        "fastest",
        "quick",
        "instant",
        "low latency",
        "real time",
        "realtime",
        "immediately",
    )

    _STREAMING_TERMS = (
        "stream",
        "streaming",
        "stream response",
        "real-time response",
    )

    def analyze(
        self,
        prompt: str,
        context: str = "",
    ) -> RoutingRequirements:
        """Analyze prompt and context and return routing requirements."""

        if not isinstance(prompt, str):
            raise TypeError("prompt must be a string")

        if not isinstance(context, str):
            raise TypeError("context must be a string")

        combined = f"{prompt}\n{context}".strip().lower()

        if not combined:
            return RoutingRequirements()

        context_tokens = self._estimate_tokens(context)
        complexity = self._estimate_complexity(combined)

        coding_required = self._contains_any(
            combined,
            self._CODING_TERMS,
        )

        reasoning_required = self._contains_any(
            combined,
            self._REASONING_TERMS,
        )

        agentic_required = self._contains_any(
            combined,
            self._AGENTIC_TERMS,
        )

        long_context_required = (
            context_tokens >= 12000
            or self._contains_any(combined, self._LONG_CONTEXT_TERMS)
        )

        streaming_required = self._contains_any(
            combined,
            self._STREAMING_TERMS,
        )

        high_quality_signal = self._contains_any(
            combined,
            self._HIGH_QUALITY_TERMS,
        )

        cost_signal = self._contains_any(
            combined,
            self._LOW_COST_TERMS,
        )

        latency_signal = self._contains_any(
            combined,
            self._LOW_LATENCY_TERMS,
        )

        quality_requirement = self._quality_requirement(
            complexity=complexity,
            reasoning_required=reasoning_required,
            agentic_required=agentic_required,
            long_context_required=long_context_required,
            high_quality_signal=high_quality_signal,
        )

        cost_sensitivity = 0.85 if cost_signal else 0.45
        latency_sensitivity = 0.85 if latency_signal else 0.45

        if high_quality_signal:
            quality_weight = 0.65
        elif complexity >= 0.8:
            quality_weight = 0.60
        else:
            quality_weight = 0.45

        if cost_signal:
            cost_weight = 0.35
        else:
            cost_weight = 0.25

        if latency_signal:
            latency_weight = 0.35
        else:
            latency_weight = 0.25

        # Normalize the three routing weights.
        total = quality_weight + cost_weight + latency_weight

        quality_weight /= total
        cost_weight /= total
        latency_weight /= total

        required_capabilities = self._required_capabilities(
            coding_required=coding_required,
            reasoning_required=reasoning_required,
            agentic_required=agentic_required,
            long_context_required=long_context_required,
            streaming_required=streaming_required,
        )

        preferred_tier = self._preferred_tier(
            complexity=complexity,
            quality_requirement=quality_requirement,
            reasoning_required=reasoning_required,
            agentic_required=agentic_required,
            long_context_required=long_context_required,
            coding_required=coding_required,
            cost_sensitivity=cost_sensitivity,
        )

        return RoutingRequirements(
            complexity=complexity,
            quality_requirement=quality_requirement,
            cost_sensitivity=cost_sensitivity,
            latency_sensitivity=latency_sensitivity,
            context_tokens=context_tokens,
            reasoning_required=reasoning_required,
            coding_required=coding_required,
            agentic_required=agentic_required,
            long_context_required=long_context_required,
            streaming_required=streaming_required,
            required_capabilities=required_capabilities,
            quality_weight=quality_weight,
            cost_weight=cost_weight,
            latency_weight=latency_weight,
            preferred_tier=preferred_tier,
        )

    @staticmethod
    def _contains_any(text: str, terms: tuple[str, ...]) -> bool:
        """Return True when any term appears in the text."""

        return any(
            re.search(rf"\b{re.escape(term)}\b", text)
            for term in terms
        )

    @staticmethod
    def _estimate_tokens(text: str) -> int:
        """Estimate tokens conservatively from whitespace-separated words."""

        if not text.strip():
            return 0

        words = len(text.split())
        return max(1, int(words * 1.3))

    def _estimate_complexity(self, text: str) -> float:
        """Estimate request complexity from semantic signals."""

        score = 0.20

        if len(text) > 200:
            score += 0.10

        if len(text) > 500:
            score += 0.10

        if len(text) > 1000:
            score += 0.10

        if self._contains_any(text, self._REASONING_TERMS):
            score += 0.15

        if self._contains_any(text, self._CODING_TERMS):
            score += 0.10

        if self._contains_any(text, self._AGENTIC_TERMS):
            score += 0.15

        if self._contains_any(text, self._HIGH_QUALITY_TERMS):
            score += 0.10

        return min(score, 1.0)

    @staticmethod
    def _quality_requirement(
        *,
        complexity: float,
        reasoning_required: bool,
        agentic_required: bool,
        long_context_required: bool,
        high_quality_signal: bool,
    ) -> float:
        """Calculate the minimum desired quality level."""

        quality = 0.40 + (complexity * 0.30)

        if reasoning_required:
            quality += 0.10

        if agentic_required:
            quality += 0.10

        if long_context_required:
            quality += 0.05

        if high_quality_signal:
            quality += 0.10

        return min(quality, 1.0)

    @staticmethod
    def _required_capabilities(
        *,
        coding_required: bool,
        reasoning_required: bool,
        agentic_required: bool,
        long_context_required: bool,
        streaming_required: bool,
    ) -> tuple[str, ...]:
        """Build the required model capability set."""

        capabilities: list[str] = []

        if coding_required:
            capabilities.append("code")

        if reasoning_required:
            capabilities.append("reasoning")

        if agentic_required:
            capabilities.append("agentic")

        if long_context_required:
            capabilities.append("long_context")

        if streaming_required:
            capabilities.append("streaming")

        return tuple(capabilities)

    @staticmethod
    def _preferred_tier(
        *,
        complexity: float,
        quality_requirement: float,
        reasoning_required: bool,
        agentic_required: bool,
        long_context_required: bool,
        coding_required: bool,
        cost_sensitivity: float,
    ) -> str:
        """Suggest an initial tier without replacing model scoring."""

        if (
            agentic_required
            or long_context_required
            or reasoning_required and complexity >= 0.75
            or quality_requirement >= 0.80
        ):
            return "llm"

        if (
            coding_required
            or complexity >= 0.50
            or quality_requirement >= 0.60
        ):
            return "mlm"

        if cost_sensitivity >= 0.70 or complexity < 0.40:
            return "slm"

        return "mlm"


