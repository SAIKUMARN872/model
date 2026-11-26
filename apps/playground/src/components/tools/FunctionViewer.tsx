import React from "react";
import {
  Code2,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Layers3,
} from "lucide-react";

interface FunctionItem {
  id: string | number;
  name: string;
  description: string;
  status: string;
}

interface FunctionViewerProps {
  functions?: FunctionItem[];
}

const defaultFunctions: FunctionItem[] = [
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

export default function FunctionViewer({
  functions = [],
}: FunctionViewerProps) {
  const data = functions.length > 0 ? functions : defaultFunctions;

  const availableCount = data.filter(
    (func) => func.status.toLowerCase() === "available"
  ).length;

  return (
    <section
      style={{
        width: "100%",
        padding: "22px",
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        boxSizing: "border-box",
        color: "#0f172a",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#eff6ff",
              color: "#2563eb",
              borderRadius: "11px",
            }}
          >
            <Code2 size={21} />
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Functions
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Available AI functions and their current status.
            </p>
          </div>
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "7px 10px",
            borderRadius: "8px",
            background: "#f1f5f9",
            color: "#475569",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          <Layers3 size={14} />
          {data.length} Functions
        </span>
      </div>

      {/* Summary */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            flex: "1 1 140px",
            padding: "13px",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            background: "#f8fafc",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "12px",
            }}
          >
            Total Functions
          </p>

          <p
            style={{
              margin: "5px 0 0",
              fontSize: "21px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {data.length}
          </p>
        </div>

        <div
          style={{
            flex: "1 1 140px",
            padding: "13px",
            border: "1px solid #bbf7d0",
            borderRadius: "10px",
            background: "#f0fdf4",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#15803d",
              fontSize: "12px",
            }}
          >
            Available
          </p>

          <p
            style={{
              margin: "5px 0 0",
              fontSize: "21px",
              fontWeight: 700,
              color: "#166534",
            }}
          >
            {availableCount}
          </p>
        </div>
      </div>

      {/* Function List */}
      {data.length > 0 ? (
        <div
          style={{
            display: "grid",
            gap: "13px",
            marginTop: "20px",
          }}
        >
          {data.map((func) => {
            const available =
              func.status.toLowerCase() === "available";

            return (
              <article
                key={func.id}
                style={{
                  padding: "17px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "11px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      minWidth: 0,
                    }}
                  >
                    <Terminal
                      size={18}
                      color="#64748b"
                    />

                    <h3
                      style={{
                        margin: 0,
                        fontFamily: "monospace",
                        fontSize: "14px",
                        fontWeight: 650,
                        color: "#1e293b",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {func.name}
                    </h3>
                  </div>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 9px",
                      borderRadius: "7px",
                      background: available ? "#dcfce7" : "#fee2e2",
                      color: available ? "#166534" : "#991b1b",
                      fontSize: "11px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {available ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <AlertCircle size={13} />
                    )}

                    {func.status}
                  </span>
                </div>

                <p
                  style={{
                    margin: "12px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                    lineHeight: 1.7,
                  }}
                >
                  {func.description}
                </p>
              </article>
            );
          })}
        </div>
      ) : (
        <p
          style={{
            marginTop: "20px",
            padding: "25px",
            textAlign: "center",
            background: "#f8fafc",
            borderRadius: "10px",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          No functions available.
        </p>
      )}
    </section>
  );
}