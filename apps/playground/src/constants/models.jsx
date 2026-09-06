"use client";

import React from "react";

export default function Models({
  models = [],
  onSelect,
}) {
  const defaultModels = [
    {
      id: "model-1",
      name: "Default AI Model",
      provider: "Local",
      version: "1.0.0",
      status: "Active",
    },
    {
      id: "model-2",
      name: "Advanced AI Model",
      provider: "AI Provider",
      version: "2.0.0",
      status: "Active",
    },
    {
      id: "model-3",
      name: "Fast AI Model",
      provider: "AI Provider",
      version: "1.5.0",
      status: "Inactive",
    },
  ];

  const modelList =
    models.length > 0
      ? models
      : defaultModels;

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#0f172a",
        }}
      >
        AI Models
      </h2>

      <p
        style={{
          color: "#64748b",
        }}
      >
        View and select available AI
        models.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        {modelList.map((model) => (
          <div
            key={model.id}
            style={{
              padding: "16px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <h3
              style={{
                marginTop: 0,
              }}
            >
              {model.name}
            </h3>

            <p>
              Provider: {model.provider}
            </p>

            <p>
              Version: {model.version}
            </p>

            <p>
              Status: {model.status}
            </p>

            <button
              type="button"
              onClick={() =>
                onSelect &&
                onSelect(model)
              }
              style={{
                marginTop: "8px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "6px",
                backgroundColor:
                  "#2563eb",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              Select Model
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}