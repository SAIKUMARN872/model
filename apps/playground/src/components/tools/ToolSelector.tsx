import React from "react";
import type { ChangeEvent } from "react";
import {
  Wrench,
  Search,
  Calculator,
  FileSearch,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

interface ToolOption {
  id: string;
  name: string;
  description: string;
}

interface ToolSelectorProps {
  tools?: ToolOption[];
  selectedTool?: string;
  onChange?: (tool: string) => void;
}

const defaultTools: ToolOption[] = [
  {
    id: "search",
    name: "Web Search",
    description: "Search the web for relevant information.",
  },
  {
    id: "calculator",
    name: "Calculator",
    description: "Perform mathematical calculations.",
  },
  {
    id: "document",
    name: "Document Search",
    description:
      "Search uploaded documents and knowledge bases.",
  },
];

export default function ToolSelector({
  tools = [],
  selectedTool = "",
  onChange,
}: ToolSelectorProps) {
  const toolList = tools.length > 0 ? tools : defaultTools;

  const selectedToolData = toolList.find(
    (tool) => tool.id === selectedTool
  );

  const handleChange = (
    event: ChangeEvent<HTMLSelectElement>
  ): void => {
    onChange?.(event.target.value);
  };

  const getToolIcon = (toolId: string) => {
    switch (toolId.toLowerCase()) {
      case "search":
        return Search;
      case "calculator":
        return Calculator;
      case "document":
        return FileSearch;
      default:
        return Wrench;
    }
  };

  return (
    <section
      style={{
        width: "100%",
        maxWidth: "420px",
        padding: "18px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#eff6ff",
            color: "#2563eb",
            borderRadius: "9px",
          }}
        >
          <Wrench size={18} />
        </div>

        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Tool Selector
          </h3>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            Choose a tool for your AI workflow.
          </p>
        </div>
      </div>

      <label
        htmlFor="tool-selector"
        style={{
          display: "block",
          marginBottom: "8px",
          fontSize: "13px",
          fontWeight: 600,
          color: "#334155",
        }}
      >
        Select Tool
      </label>

      <div style={{ position: "relative" }}>
        <select
          id="tool-selector"
          value={selectedTool}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "12px 38px 12px 13px",
            borderRadius: "9px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#0f172a",
            fontSize: "13px",
            cursor: "pointer",
            outline: "none",
            appearance: "none",
            boxSizing: "border-box",
          }}
        >
          <option value="">Select a tool</option>

          {toolList.map((tool) => (
            <option key={tool.id} value={tool.id}>
              {tool.name}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          style={{
            position: "absolute",
            right: "13px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#64748b",
            pointerEvents: "none",
          }}
        />
      </div>

      {selectedToolData && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "11px",
            marginTop: "15px",
            padding: "13px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "9px",
          }}
        >
          {(() => {
            const ToolIcon = getToolIcon(selectedToolData.id);

            return (
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#eff6ff",
                  color: "#2563eb",
                  borderRadius: "8px",
                }}
              >
                <ToolIcon size={17} />
              </div>
            );
          })()}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 650,
                  color: "#1e293b",
                }}
              >
                {selectedToolData.name}
              </span>

              <CheckCircle2
                size={14}
                color="#16a34a"
              />
            </div>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: "12px",
                lineHeight: 1.6,
                color: "#64748b",
              }}
            >
              {selectedToolData.description}
            </p>
          </div>
        </div>
      )}

      <p
        style={{
          margin: "12px 0 0",
          fontSize: "11px",
          color: "#94a3b8",
        }}
      >
        {toolList.length} tools available
      </p>
    </section>
  );
}