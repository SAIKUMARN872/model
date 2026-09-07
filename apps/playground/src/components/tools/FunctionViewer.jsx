"use client";

import React from "react";

export default function FunctionViewer({
  functions = [],
}) {
  const defaultFunctions = [
    {
      id: 1,
      name: "searchKnowledge",
      description:
        "Searches the knowledge base for relevant information.",
      status: "Available",
    },
    {
      id: 2,
      name: "generateResponse",
      description:
        "Generates an AI response using the retrieved context.",
      status: "Available",
    },
    {
      id: 3,
      name: "analyzeDocument",
      description:
        "Analyzes uploaded documents and extracts useful information.",
      status: "Available",
    },
  ];

  const data =
    functions.length > 0
      ? functions
      : defaultFunctions;

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
        Functions
      </h2>

      <p
        style={{
          color: "#64748b",
        }}
      >
        View available AI functions and
        their current status.
      </p>

      <div
        style={{
          display: "grid",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        {data.map((func) => (
          <div
            key={func.id}
            style={{
              padding: "16px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: "monospace",
                }}
              >
                {func.name}
              </h3>

              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  backgroundColor:
                    func.status === "Available"
                      ? "#dcfce7"
                      : "#fee2e2",
                  color:
                    func.status === "Available"
                      ? "#166534"
                      : "#991b1b",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {func.status}
              </span>
            </div>

            <p
              style={{
                marginTop: "12px",
                color: "#475569",
              }}
            >
              {func.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}