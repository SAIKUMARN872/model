"use client";

import React from "react";

export default function Spinner({
  size = 40,
  label = "Loading...",
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: "4px solid #e2e8f0",
          borderTop:
            "4px solid #2563eb",
          borderRadius: "50%",
          animation:
            "spinner-rotate 1s linear infinite",
        }}
      />

      {label && (
        <span
          style={{
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          {label}
        </span>
      )}

      <style jsx>{`
        @keyframes spinner-rotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}