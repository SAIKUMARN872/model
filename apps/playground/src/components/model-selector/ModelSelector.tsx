import React from "react";
import { ChevronDown, Cpu } from "lucide-react";

interface ModelOption {
  id: string;
  name: string;
  provider: string;
}

interface ModelSelectorProps {
  models?: ModelOption[];
  selectedModel?: string;
  onChange?: (model: string) => void;
}

const defaultModels: ModelOption[] = [
  {
    id: "default",
    name: "Default AI Model",
    provider: "Local",
  },
  {
    id: "advanced",
    name: "Advanced AI Model",
    provider: "AI Provider",
  },
  {
    id: "fast",
    name: "Fast AI Model",
    provider: "AI Provider",
  },
];

export default function ModelSelector({
  models = [],
  selectedModel = "",
  onChange,
}: ModelSelectorProps) {
  const modelList = models.length > 0 ? models : defaultModels;

  return (
    <div className="model-selector">
      <label
        htmlFor="model-selector"
        className="model-selector-label"
      >
        <Cpu size={15} />
        Select AI Model
      </label>

      <div className="model-selector-control">
        <select
          id="model-selector"
          className="model-selector-select"
          value={selectedModel}
          onChange={(event) => onChange?.(event.target.value)}
          aria-label="Select AI Model"
        >
          {!selectedModel && (
            <option value="" disabled>
              Choose a model
            </option>
          )}

          {modelList.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} — {model.provider}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="model-selector-chevron"
        />
      </div>

      {modelList.length === 0 && (
        <p className="model-selector-empty">
          No AI models available.
        </p>
      )}
    </div>
  );
}