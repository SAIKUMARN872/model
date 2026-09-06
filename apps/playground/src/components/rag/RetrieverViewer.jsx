"use client";

import React from "react";

export default function RetrieverViewer({
  results = [],
}) {
  const defaultResults = [
    {
      id: 1,
      title: "Document Result",
      content:
        "Relevant information retrieved from the knowledge base.",
      score: 0.95,
      source: "document.pdf",
    },
    {
      id: 2,
      title: "Knowledge Base Result",
      content:
        "Additional context retrieved for the AI response.",
      score: 0.87,
      source: "knowledge.txt",
    },
  ];

  const data =
    results.length > 0
      ? results
      : defaultResults;

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
        Retrieved Results
      </h2>

      <p
        style={{
          color: "#64748b",
        }}
      >
        View information retrieved
        from the knowledge base.
      </p>

      <div
        style={{
          display: "grid",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        {data.map((result) => (
          <div
            key={result.id}
            style={{
              padding: "16px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                }}
              >
                {result.title}
              </h3>

              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  backgroundColor:
                    "#dcfce7",
                  color: "#166534",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {(result.score * 100).toFixed(
                  0
                )}%
              </span>
            </div>

            <p
              style={{
                marginTop: "12px",
                color: "#475569",
              }}
            >
              {result.content}
            </p>

            <small
              style={{
                color: "#64748b",
              }}
            >
              Source: {result.source}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}