"use client";

import React from "react";

export default function ToolSelector({
  tools = [],
  selectedTool = "",
  onChange,
}) {
  const defaultTools = [
    {
      id: "search",
      name: "Web Search",
      description:
        "Search the web for relevant information.",
    },
    {
      id: "calculator",
      name: "Calculator",
      description:
        "Perform mathematical calculations.",
    },
    {
      id: "document",
      name: "Document Search",
      description:
        "Search uploaded documents and knowledge bases.",
    },
  ];

  const toolList =
    tools.length > 0
      ? tools
      : defaultTools;

  const handleChange = (event) => {
    const value =
      event.target.value;

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
        htmlFor="tool-selector"
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: 600,
          color: "#0f172a",
        }}
      >
        Select Tool
      </label>

      <select
        id="tool-selector"
        value={selectedTool}
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
          Select a tool
        </option>

        {toolList.map((tool) => (
          <option
            key={tool.id}
            value={tool.id}
          >
            {tool.name}
          </option>
        ))}
      </select>

      {selectedTool && (
        <p
          style={{
            marginTop: "10px",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          {
            toolList.find(
              (tool) =>
                tool.id === selectedTool
            )?.description
          }
        </p>
      )}
    </div>
  );
}