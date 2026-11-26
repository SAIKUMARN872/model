export const MODEL_TIERS = Object.freeze({
  SLM: "slm",
  MLM: "mlm",
  LLM: "llm"
});

export const MODEL_SELECTION_MODES = Object.freeze({
  AUTO: "auto",
  MANUAL: "manual"
});

export const MODEL_CAPABILITIES = Object.freeze([
  "chat",
  "reasoning",
  "coding",
  "research",
  "vision",
  "audio",
  "embeddings",
  "tool_use"
]);

export function normalizeModelSummary(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Model summary must be an object.");
  }

  const id = typeof value.id === "string"
    ? value.id
    : typeof value.model_id === "string"
      ? value.model_id
      : "";

  if (!id.trim()) {
    throw new TypeError("Model summary requires a model identifier.");
  }

  const name = typeof value.name === "string" && value.name.trim()
    ? value.name.trim()
    : id;

  const capabilities = Array.isArray(value.capabilities)
    ? [...new Set(value.capabilities.filter(
        item => typeof item === "string" && MODEL_CAPABILITIES.includes(item)
      ))]
    : [];

  return Object.freeze({
    id: id.trim(),
    name,
    provider: typeof value.provider === "string" ? value.provider : null,
    tier: typeof value.tier === "string" ? value.tier : null,
    contextLength: Number.isSafeInteger(value.contextLength)
      ? value.contextLength
      : Number.isSafeInteger(value.context_window)
        ? value.context_window
        : null,
    capabilities: Object.freeze(capabilities),
    enabled: value.enabled !== false
  });
}

export function normalizeModelList(value) {
  if (!Array.isArray(value)) {
    throw new TypeError("Model catalog response must be an array.");
  }

  const seen = new Set();

  return value.map(normalizeModelSummary).filter(model => {
    if (seen.has(model.id)) return false;
    seen.add(model.id);
    return true;
  });
}
