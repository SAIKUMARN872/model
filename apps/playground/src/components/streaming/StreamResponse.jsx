"use client";

import React from "react";

export default function StreamResponse({
  content = "",
  isStreaming = false,
}) {
  return (
    <div
      style={{
        width: "100%",
        padding: "16px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#0f172a",
          }}
        >
          AI Response
        </h3>

        {isStreaming && (
          <span
            style={{
              fontSize: "13px",
              color: "#2563eb",
            }}
          >
            Generating...
          </span>
        )}
      </div>

      <div
        style={{
          minHeight: "60px",
          padding: "12px",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          color: "#334155",
          whiteSpace: "pre-wrap",
          lineHeight: "1.6",
        }}
      >
        {content || "Waiting for response..."}
        {isStreaming && (
          <span
            style={{
              display: "inline-block",
              marginLeft: "4px",
              animation:
                "blink 1s infinite",
            }}
          >
            ▌
          </span>
        )}
      </div>

      <style jsx>{`
        @keyframes blink {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}