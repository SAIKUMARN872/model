"use client";

import React, { useState } from "react";

export default function PromptEditor({
  initialPrompt = "",
  onSave,
}) {
  const [prompt, setPrompt] =
    useState(initialPrompt);

  const handleSave = () => {
    if (!prompt.trim()) {
      return;
    }

    if (onSave) {
      onSave(prompt);
    }
  };

  const handleClear = () => {
    setPrompt("");
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#0f172a",
        }}
      >
        Prompt Editor
      </h2>

      <p
        style={{
          color: "#64748b",
        }}
      >
        Create and edit your AI
        prompts.
      </p>

      <textarea
        value={prompt}
        onChange={(event) =>
          setPrompt(event.target.value)
        }
        placeholder="Enter your prompt here..."
        rows={8}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "12px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          resize: "vertical",
          boxSizing: "border-box",
          fontFamily: "inherit",
          fontSize: "14px",
          outline: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "16px",
        }}
      >
        <button
          type="button"
          onClick={handleSave}
          disabled={!prompt.trim()}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            backgroundColor:
              prompt.trim()
                ? "#2563eb"
                : "#94a3b8",
            color: "#ffffff",
            cursor:
              prompt.trim()
                ? "pointer"
                : "not-allowed",
          }}
        >
          Save Prompt
        </button>

        <button
          type="button"
          onClick={handleClear}
          style={{
            padding: "10px 20px",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            backgroundColor: "#ffffff",
            color: "#0f172a",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}