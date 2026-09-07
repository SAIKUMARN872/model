"use client";

import React from "react";

export default function Environment({
  variables = {},
}) {
  const defaultVariables = {
    NODE_ENV: "development",
    API_URL: "http://localhost:3000",
    APP_NAME: "AI Platform",
    VERSION: "1.0.0",
  };

  const data = {
    ...defaultVariables,
    ...variables,
  };

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
        Environment
      </h2>

      <p
        style={{
          color: "#64748b",
        }}
      >
        View the current application
        environment configuration.
      </p>

      <div
        style={{
          marginTop: "20px",
          display: "grid",
          gap: "12px",
        }}
      >
        {Object.entries(data).map(
          ([key, value]) => (
            <div
              key={key}
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                gap: "20px",
                padding: "14px 16px",
                backgroundColor:
                  "#f8fafc",
                borderRadius: "8px",
                border:
                  "1px solid #e2e8f0",
              }}
            >
              <strong
                style={{
                  color: "#334155",
                }}
              >
                {key}
              </strong>

              <span
                style={{
                  color: "#64748b",
                  wordBreak:
                    "break-word",
                  textAlign: "right",
                }}
              >
                {String(value)}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}