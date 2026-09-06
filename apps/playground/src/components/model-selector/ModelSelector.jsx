"use client";

import React from "react";

export default function ModelSelector({
  models = [],
  selectedModel = "",
  onChange,
}) {
  const defaultModels = [
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

  const modelList =
    models.length > 0
      ? models
      : defaultModels;

  const handleChange = (event) => {
    const value = event.target.value;

    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
      }}
    >
      <label
        htmlFor="model-selector"
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: 600,
          color: "#0f172a",
        }}
      >
        Select AI Model
      </label>

      <select
        id="model-selector"
        value={selectedModel}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border:
            "1px solid #cbd5e1",
          backgroundColor: "#ffffff",
          color: "#0f172a",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <option value="">
          Select a model
        </option>

        {modelList.map((model) => (
          <option
            key={model.id}
            value={model.id}
          >
            {model.name} -{" "}
            {model.provider}
          </option>
        ))}
      </select>
    </div>
  );
}