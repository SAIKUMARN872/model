"use client";

/**
 * Enterprise Model Registry Constants
 *
 * Central source of truth for AI model metadata
 * used throughout the Console application.
 *
 * Responsibilities:
 * - Define supported AI models
 * - Define providers
 * - Define model capabilities
 * - Define model status
 * - Define context windows
 * - Define token pricing metadata
 * - Provide model lookup helpers
 * - Provide filtering helpers
 */

/**
 * Model providers.
 */
export const MODEL_PROVIDERS = Object.freeze({
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GOOGLE: "google",
  META: "meta",
  MISTRAL: "mistral",
  COHERE: "cohere",
  AZURE_OPENAI: "azure_openai",
  CUSTOM: "custom",
});

/**
 * Model status.
 */
export const MODEL_STATUS = Object.freeze({
  ACTIVE: "active",
  BETA: "beta",
  DEPRECATED: "deprecated",
  DISABLED: "disabled",
});

/**
 * Model capabilities.
 */
export const MODEL_CAPABILITIES =
  Object.freeze({
    CHAT: "chat",
    COMPLETION: "completion",
    EMBEDDING: "embedding",
    VISION: "vision",
    AUDIO_INPUT: "audio_input",
    AUDIO_OUTPUT: "audio_output",
    FUNCTION_CALLING:
      "function_calling",
    TOOL_USE: "tool_use",
    JSON_MODE: "json_mode",
    STRUCTURED_OUTPUT:
      "structured_output",
    REASONING: "reasoning",
    CODE_GENERATION:
      "code_generation",
  });

/**
 * Model categories.
 */
export const MODEL_CATEGORIES =
  Object.freeze({
    CHAT: "chat",
    REASONING: "reasoning",
    EMBEDDING: "embedding",
    MULTIMODAL: "multimodal",
    CODE: "code",
    AUDIO: "audio",
  });

/**
 * Central model registry.
 *
 * Pricing values are examples and should
 * be synchronized with your backend billing
 * configuration in production.
 *
 * Pricing unit:
 * USD per 1 million tokens.
 */
export const MODELS = Object.freeze([
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider:
      MODEL_PROVIDERS.OPENAI,
    category:
      MODEL_CATEGORIES.MULTIMODAL,
    status:
      MODEL_STATUS.ACTIVE,

    description:
      "General-purpose multimodal model for text, image, and structured AI workloads.",

    contextWindow:
      128000,

    capabilities: [
      MODEL_CAPABILITIES.CHAT,
      MODEL_CAPABILITIES.VISION,
      MODEL_CAPABILITIES.FUNCTION_CALLING,
      MODEL_CAPABILITIES.JSON_MODE,
      MODEL_CAPABILITIES.STRUCTURED_OUTPUT,
    ],

    pricing: {
      inputPerMillionTokens:
        2.5,

      outputPerMillionTokens:
        10,
    },

    metadata: {
      supportsStreaming: true,
      supportsSystemMessages: true,
      supportsTools: true,
    },
  },

  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider:
      MODEL_PROVIDERS.OPENAI,
    category:
      MODEL_CATEGORIES.CHAT,
    status:
      MODEL_STATUS.ACTIVE,

    description:
      "Cost-efficient model for high-volume AI applications.",

    contextWindow:
      128000,

    capabilities: [
      MODEL_CAPABILITIES.CHAT,
      MODEL_CAPABILITIES.FUNCTION_CALLING,
      MODEL_CAPABILITIES.JSON_MODE,
      MODEL_CAPABILITIES.STRUCTURED_OUTPUT,
    ],

    pricing: {
      inputPerMillionTokens:
        0.15,

      outputPerMillionTokens:
        0.6,
    },

    metadata: {
      supportsStreaming: true,
      supportsSystemMessages: true,
      supportsTools: true,
    },
  },

  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider:
      MODEL_PROVIDERS.ANTHROPIC,
    category:
      MODEL_CATEGORIES.CHAT,
    status:
      MODEL_STATUS.ACTIVE,

    description:
      "High-performance language model designed for reasoning, coding, and enterprise workloads.",

    contextWindow:
      200000,

    capabilities: [
      MODEL_CAPABILITIES.CHAT,
      MODEL_CAPABILITIES.TOOL_USE,
      MODEL_CAPABILITIES.CODE_GENERATION,
      MODEL_CAPABILITIES.VISION,
    ],

    pricing: {
      inputPerMillionTokens:
        3,

      outputPerMillionTokens:
        15,
    },

    metadata: {
      supportsStreaming: true,
      supportsSystemMessages: true,
      supportsTools: true,
    },
  },

  {
    id: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    provider:
      MODEL_PROVIDERS.GOOGLE,
    category:
      MODEL_CATEGORIES.MULTIMODAL,
    status:
      MODEL_STATUS.ACTIVE,

    description:
      "Large-context multimodal model for enterprise AI workloads.",

    contextWindow:
      2000000,

    capabilities: [
      MODEL_CAPABILITIES.CHAT,
      MODEL_CAPABILITIES.VISION,
      MODEL_CAPABILITIES.FUNCTION_CALLING,
      MODEL_CAPABILITIES.CODE_GENERATION,
    ],

    pricing: {
      inputPerMillionTokens:
        3.5,

      outputPerMillionTokens:
        10.5,
    },

    metadata: {
      supportsStreaming: true,
      supportsSystemMessages: true,
      supportsTools: true,
    },
  },

  {
    id: "llama-3-1-70b",
    name: "Llama 3.1 70B",
    provider:
      MODEL_PROVIDERS.META,
    category:
      MODEL_CATEGORIES.REASONING,
    status:
      MODEL_STATUS.ACTIVE,

    description:
      "Open-weight large language model suitable for enterprise and self-hosted deployments.",

    contextWindow:
      128000,

    capabilities: [
      MODEL_CAPABILITIES.CHAT,
      MODEL_CAPABILITIES.COMPLETION,
      MODEL_CAPABILITIES.CODE_GENERATION,
    ],

    pricing: {
      inputPerMillionTokens:
        0,
      outputPerMillionTokens:
        0,
    },

    metadata: {
      supportsStreaming: true,
      supportsSystemMessages: true,
      supportsTools: false,
      selfHosted: true,
    },
  },

  {
    id: "mistral-large",
    name: "Mistral Large",
    provider:
      MODEL_PROVIDERS.MISTRAL,
    category:
      MODEL_CATEGORIES.REASONING,
    status:
      MODEL_STATUS.ACTIVE,

    description:
      "Enterprise-grade language model for complex reasoning and multilingual applications.",

    contextWindow:
      128000,

    capabilities: [
      MODEL_CAPABILITIES.CHAT,
      MODEL_CAPABILITIES.FUNCTION_CALLING,
      MODEL_CAPABILITIES.JSON_MODE,
      MODEL_CAPABILITIES.CODE_GENERATION,
    ],

    pricing: {
      inputPerMillionTokens:
        2,

      outputPerMillionTokens:
        6,
    },

    metadata: {
      supportsStreaming: true,
      supportsSystemMessages: true,
      supportsTools: true,
    },
  },

  {
    id: "text-embedding-3-large",
    name: "Text Embedding 3 Large",
    provider:
      MODEL_PROVIDERS.OPENAI,
    category:
      MODEL_CATEGORIES.EMBEDDING,
    status:
      MODEL_STATUS.ACTIVE,

    description:
      "High-quality embedding model for semantic search and retrieval-augmented generation.",

    contextWindow:
      8191,

    capabilities: [
      MODEL_CAPABILITIES.EMBEDDING,
    ],

    pricing: {
      inputPerMillionTokens:
        0.13,

      outputPerMillionTokens:
        0,
    },

    metadata: {
      supportsStreaming: false,
      supportsSystemMessages: false,
      supportsTools: false,
    },
  },
]);

/**
 * Default model.
 */
export const DEFAULT_MODEL_ID =
  "gpt-4o-mini";

/**
 * Get a model by ID.
 */
export const getModelById = (
  modelId
) => {
  if (!modelId) {
    return null;
  }

  return (
    MODELS.find(
      (model) =>
        model.id === modelId
    ) || null
  );
};

/**
 * Get all active models.
 */
export const getActiveModels =
  () => {
    return MODELS.filter(
      (model) =>
        model.status ===
        MODEL_STATUS.ACTIVE
    );
  };

/**
 * Get models by provider.
 */
export const getModelsByProvider =
  (
    provider
  ) => {
    if (!provider) {
      return [];
    }

    return MODELS.filter(
      (model) =>
        model.provider ===
        provider
    );
  };

/**
 * Get models by category.
 */
export const getModelsByCategory =
  (
    category
  ) => {
    if (!category) {
      return [];
    }

    return MODELS.filter(
      (model) =>
        model.category ===
        category
    );
  };

/**
 * Get models supporting
 * a specific capability.
 */
export const getModelsByCapability =
  (
    capability
  ) => {
    if (!capability) {
      return [];
    }

    return MODELS.filter(
      (model) =>
        model.capabilities.includes(
          capability
        )
    );
  };

/**
 * Check whether a model
 * supports a capability.
 */
export const modelSupportsCapability =
  (
    modelId,
    capability
  ) => {
    const model =
      getModelById(
        modelId
      );

    if (!model) {
      return false;
    }

    return model.capabilities.includes(
      capability
    );
  };

/**
 * Check whether a model is active.
 */
export const isModelActive = (
  modelId
) => {
  const model =
    getModelById(
      modelId
    );

  return (
    model?.status ===
    MODEL_STATUS.ACTIVE
  );
};

/**
 * Calculate estimated token cost.
 *
 * Pricing is calculated using
 * USD per million tokens.
 */
export const calculateModelCost =
  (
    modelId,
    inputTokens = 0,
    outputTokens = 0
  ) => {
    const model =
      getModelById(
        modelId
      );

    if (!model) {
      return 0;
    }

    const inputCost =
      (Number(
        inputTokens
      ) /
        1_000_000) *
      model.pricing
        .inputPerMillionTokens;

    const outputCost =
      (Number(
        outputTokens
      ) /
        1_000_000) *
      model.pricing
        .outputPerMillionTokens;

    return (
      inputCost +
      outputCost
    );
  };

/**
 * Format model context window.
 */
export const formatContextWindow =
  (
    contextWindow
  ) => {
    const value =
      Number(
        contextWindow
      ) || 0;

    if (
      value >=
      1_000_000
    ) {
      return `${(
        value /
        1_000_000
      ).toFixed(1)}M tokens`;
    }

    if (
      value >= 1_000
    ) {
      return `${(
        value /
        1_000
      ).toFixed(0)}K tokens`;
    }

    return `${value} tokens`;
  };

/**
 * Default export.
 */
export default MODELS;