"use client";

import React from "react";

export default function ResponseViewer({
  response = "",
  title = "AI Response",
  status = "Completed",
}) {
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#0f172a",
          }}
        >
          {title}
        </h2>

        <span
          style={{
            padding: "5px 10px",
            borderRadius: "6px",
            backgroundColor:
              status === "Completed"
                ? "#dcfce7"
                : "#fef3c7",
            color:
              status === "Completed"
                ? "#166534"
                : "#92400e",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {status}
        </span>
      </div>

      <div
        style={{
          padding: "16px",
          minHeight: "100px",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          color: "#334155",
          whiteSpace: "pre-wrap",
          lineHeight: "1.6",
        }}
      >
        {response ||
          "No response available."}
      </div>
    </div>
  );
}