import React, {
  useMemo,
  useState,
} from "react";

/**
 * AI Model Registry
 *
 * Central model management layer.
 *
 * Responsibilities:
 * - Register AI models
 * - Track model metadata
 * - Manage model providers
 * - Track model status
 * - Manage capabilities
 * - Support model filtering
 * - Provide model lookup utilities
 */

/* -------------------------------------------------
   Model Status
------------------------------------------------- */

export const MODEL_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DEPRECATED: "deprecated",
  BETA: "beta",
  MAINTENANCE: "maintenance",
};

/* -------------------------------------------------
   Model Providers
------------------------------------------------- */

export const MODEL_PROVIDERS = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GOOGLE: "google",
  META: "meta",
  MISTRAL: "mistral",
  COHERE: "cohere",
  CUSTOM: "custom",
};

/* -------------------------------------------------
   Model Capabilities
------------------------------------------------- */

export const MODEL_CAPABILITIES = {
  CHAT: "chat",
  COMPLETION: "completion",
  VISION: "vision",
  EMBEDDINGS: "embeddings",
  AUDIO: "audio",
  IMAGE: "image",
  TOOL_CALLING: "tool_calling",
  JSON: "json",
  CODE: "code",
  REASONING: "reasoning",
};

/* -------------------------------------------------
   Default Models
------------------------------------------------- */

export const DEFAULT_MODELS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: MODEL_PROVIDERS.OPENAI,
    version: "4o",
    status: MODEL_STATUS.ACTIVE,
    capabilities: [
      MODEL_CAPABILITIES.CHAT,
      MODEL_CAPABILITIES.VISION,
      MODEL_CAPABILITIES.TOOL_CALLING,
      MODEL_CAPABILITIES.JSON,
      MODEL_CAPABILITIES.CODE,
    ],
    contextWindow: 128000,
    inputCostPer1K: 0.005,
    outputCostPer1K: 0.015,
    description:
      "General-purpose multimodal AI model.",
    tags: [
      "multimodal",
      "general-purpose",
      "production",
    ],
  },

  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider:
      MODEL_PROVIDERS.ANTHROPIC,
    version: "3.5",
    status: MODEL_STATUS.ACTIVE,
    capabilities: [
      MODEL_CAPABILITIES.CHAT,
      MODEL_CAPABILITIES.VISION,
      MODEL_CAPABILITIES.TOOL_CALLING,
      MODEL_CAPABILITIES.CODE,
      MODEL_CAPABILITIES.REASONING,
    ],
    contextWindow: 200000,
    inputCostPer1K: 0.003,
    outputCostPer1K: 0.015,
    description:
      "Advanced reasoning and coding model.",
    tags: [
      "reasoning",
      "coding",
      "production",
    ],
  },

  {
    id: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    provider:
      MODEL_PROVIDERS.GOOGLE,
    version: "1.5",
    status: MODEL_STATUS.ACTIVE,
    capabilities: [
      MODEL_CAPABILITIES.CHAT,
      MODEL_CAPABILITIES.VISION,
      MODEL_CAPABILITIES.LONG_CONTEXT,
      MODEL_CAPABILITIES.TOOL_CALLING,
    ],
    contextWindow: 1000000,
    inputCostPer1K: 0.0035,
    outputCostPer1K: 0.0105,
    description:
      "Long-context multimodal AI model.",
    tags: [
      "long-context",
      "multimodal",
    ],
  },

  {
    id: "llama-3-1-70b",
    name: "Llama 3.1 70B",
    provider:
      MODEL_PROVIDERS.META,
    version: "3.1",
    status: MODEL_STATUS.ACTIVE,
    capabilities: [
      MODEL_CAPABILITIES.CHAT,
      MODEL_CAPABILITIES.CODE,
      MODEL_CAPABILITIES.REASONING,
    ],
    contextWindow: 128000,
    inputCostPer1K: 0.0009,
    outputCostPer1K: 0.0009,
    description:
      "Open-weight large language model.",
    tags: [
      "open-source",
      "coding",
      "reasoning",
    ],
  },
];

/* -------------------------------------------------
   Normalize Model
------------------------------------------------- */

export function normalizeModel(
  model = {}
) {
  return {
    id:
      model.id ||
      model.modelId ||
      cryptoSafeId(),

    name:
      model.name ||
      model.displayName ||
      "Unnamed Model",

    provider:
      model.provider ||
      MODEL_PROVIDERS.CUSTOM,

    version:
      model.version ||
      "latest",

    status:
      model.status ||
      MODEL_STATUS.ACTIVE,

    capabilities:
      Array.isArray(
        model.capabilities
      )
        ? model.capabilities
        : [],

    contextWindow:
      Number(
        model.contextWindow ||
          0
      ),

    inputCostPer1K:
      Number(
        model.inputCostPer1K ||
          0
      ),

    outputCostPer1K:
      Number(
        model.outputCostPer1K ||
          0
      ),

    description:
      model.description ||
      "",

    tags:
      Array.isArray(
        model.tags
      )
        ? model.tags
        : [],

    metadata:
      model.metadata || {},

    createdAt:
      model.createdAt ||
      new Date().toISOString(),

    updatedAt:
      model.updatedAt ||
      new Date().toISOString(),
  };
}

/* -------------------------------------------------
   Model Registry
------------------------------------------------- */

export class ModelRegistry {
  constructor(
    models = []
  ) {
    this.models = new Map();

    models.forEach(
      (model) => {
        const normalized =
          normalizeModel(
            model
          );

        this.models.set(
          normalized.id,
          normalized
        );
      }
    );
  }

  register(model) {
    const normalized =
      normalizeModel(
        model
      );

    this.models.set(
      normalized.id,
      normalized
    );

    return normalized;
  }

  unregister(modelId) {
    return this.models.delete(
      modelId
    );
  }

  get(modelId) {
    return (
      this.models.get(
        modelId
      ) || null
    );
  }

  getAll() {
    return Array.from(
      this.models.values()
    );
  }

  findByProvider(
    provider
  ) {
    return this.getAll().filter(
      (model) =>
        model.provider ===
        provider
    );
  }

  findByStatus(
    status
  ) {
    return this.getAll().filter(
      (model) =>
        model.status ===
        status
    );
  }

  findByCapability(
    capability
  ) {
    return this.getAll().filter(
      (model) =>
        model.capabilities.includes(
          capability
        )
    );
  }

  search(query) {
    const searchTerm =
      String(query || "")
        .toLowerCase()
        .trim();

    if (!searchTerm) {
      return this.getAll();
    }

    return this.getAll().filter(
      (model) => {
        const searchableText =
          [
            model.id,
            model.name,
            model.provider,
            model.version,
            model.description,
            ...model.tags,
            ...model.capabilities,
          ]
            .join(" ")
            .toLowerCase();

        return searchableText.includes(
          searchTerm
        );
      }
    );
  }

  update(
    modelId,
    updates
  ) {
    const existing =
      this.get(modelId);

    if (!existing) {
      return null;
    }

    const updated =
      normalizeModel({
        ...existing,
        ...updates,
        id: modelId,
        updatedAt:
          new Date().toISOString(),
      });

    this.models.set(
      modelId,
      updated
    );

    return updated;
  }
}

/* -------------------------------------------------
   Default Registry
------------------------------------------------- */

export const modelRegistry =
  new ModelRegistry(
    DEFAULT_MODELS
  );

/* -------------------------------------------------
   Model Utility Functions
------------------------------------------------- */

export function getModel(
  modelId
) {
  return modelRegistry.get(
    modelId
  );
}

export function getModels() {
  return modelRegistry.getAll();
}

export function registerModel(
  model
) {
  return modelRegistry.register(
    model
  );
}

export function removeModel(
  modelId
) {
  return modelRegistry.unregister(
    modelId
  );
}

export function updateModel(
  modelId,
  updates
) {
  return modelRegistry.update(
    modelId,
    updates
  );
}

export function searchModels(
  query
) {
  return modelRegistry.search(
    query
  );
}

export function getModelsByProvider(
  provider
) {
  return modelRegistry.findByProvider(
    provider
  );
}

export function getModelsByCapability(
  capability
) {
  return modelRegistry.findByCapability(
    capability
  );
}

export function getActiveModels() {
  return modelRegistry.findByStatus(
    MODEL_STATUS.ACTIVE
  );
}

/* -------------------------------------------------
   React Hook
------------------------------------------------- */

export function useModels(
  initialModels = DEFAULT_MODELS
) {
  const [
    models,
    setModels,
  ] = useState(
    initialModels.map(
      normalizeModel
    )
  );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    providerFilter,
    setProviderFilter,
  ] = useState("all");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const filteredModels =
    useMemo(() => {
      return models.filter(
        (model) => {
          const matchesSearch =
            !searchQuery ||
            [
              model.id,
              model.name,
              model.provider,
              model.description,
              ...model.tags,
            ]
              .join(" ")
              .toLowerCase()
              .includes(
                searchQuery
                  .toLowerCase()
              );

          const matchesProvider =
            providerFilter ===
              "all" ||
            model.provider ===
              providerFilter;

          const matchesStatus =
            statusFilter ===
              "all" ||
            model.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesProvider &&
            matchesStatus
          );
        }
      );
    }, [
      models,
      searchQuery,
      providerFilter,
      statusFilter,
    ]);

  const addModel = (
    model
  ) => {
    const normalized =
      normalizeModel(
        model
      );

    setModels(
      (current) => [
        ...current,
        normalized,
      ]
    );

    return normalized;
  };

  const removeModelById = (
    modelId
  ) => {
    setModels(
      (current) =>
        current.filter(
          (model) =>
            model.id !==
            modelId
        )
    );
  };

  const updateModelById = (
    modelId,
    updates
  ) => {
    let updatedModel =
      null;

    setModels(
      (current) =>
        current.map(
          (model) => {
            if (
              model.id !==
              modelId
            ) {
              return model;
            }

            updatedModel =
              normalizeModel({
                ...model,
                ...updates,
                id: modelId,
              });

            return updatedModel;
          }
        )
    );

    return updatedModel;
  };

  return {
    models,
    filteredModels,

    searchQuery,
    setSearchQuery,

    providerFilter,
    setProviderFilter,

    statusFilter,
    setStatusFilter,

    addModel,
    removeModel:
      removeModelById,
    updateModel:
      updateModelById,
  };
}

/* -------------------------------------------------
   Model Validation
------------------------------------------------- */

export function validateModel(
  model
) {
  const errors = {};

  if (
    !model ||
    typeof model !==
      "object"
  ) {
    return {
      valid: false,
      errors: {
        model:
          "Model must be an object.",
      },
    };
  }

  if (!model.id) {
    errors.id =
      "Model ID is required.";
  }

  if (!model.name) {
    errors.name =
      "Model name is required.";
  }

  if (!model.provider) {
    errors.provider =
      "Model provider is required.";
  }

  if (
    model.capabilities &&
    !Array.isArray(
      model.capabilities
    )
  ) {
    errors.capabilities =
      "Capabilities must be an array.";
  }

  return {
    valid:
      Object.keys(
        errors
      ).length === 0,

    errors,
  };
}

/* -------------------------------------------------
   Safe ID Generator
------------------------------------------------- */

function cryptoSafeId() {
  if (
    typeof crypto !==
      "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `model-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default {
  MODEL_STATUS,
  MODEL_PROVIDERS,
  MODEL_CAPABILITIES,
  DEFAULT_MODELS,

  ModelRegistry,
  modelRegistry,

  getModel,
  getModels,
  registerModel,
  removeModel,
  updateModel,

  searchModels,
  getModelsByProvider,
  getModelsByCapability,
  getActiveModels,

  useModels,
  validateModel,
  normalizeModel,
};