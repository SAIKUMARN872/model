"use client";

import React from "react";

export default function Providers({
  providers = [],
  onSelect,
}) {
  const defaultProviders = [
    {
      id: "openai",
      name: "OpenAI",
      description:
        "AI models for text generation and intelligent applications.",
      status: "Active",
    },
    {
      id: "anthropic",
      name: "Anthropic",
      description:
        "AI models focused on helpful and reliable responses.",
      status: "Active",
    },
    {
      id: "google",
      name: "Google AI",
      description:
        "AI models and services for application development.",
      status: "Active",
    },
  ];

  const providerList =
    providers.length > 0
      ? providers
      : defaultProviders;

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
        AI Providers
      </h2>

      <p
        style={{
          color: "#64748b",
        }}
      >
        View and manage available AI
        providers.
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
        {providerList.map(
          (provider) => (
            <div
              key={provider.id}
              style={{
                padding: "16px",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  color: "#0f172a",
                }}
              >
                {provider.name}
              </h3>

              <p
                style={{
                  color: "#64748b",
                }}
              >
                {provider.description}
              </p>

              <p>
                Status:{" "}
                <strong>
                  {provider.status}
                </strong>
              </p>

              <button
                type="button"
                onClick={() =>
                  onSelect &&
                  onSelect(provider)
                }
                style={{
                  marginTop: "8px",
                  padding:
                    "10px 16px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor:
                    "#2563eb",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Select Provider
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}