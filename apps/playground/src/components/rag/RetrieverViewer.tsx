import React from "react";
import {
  Database,
  FileText,
  CheckCircle2,
  Search,
  Layers3,
} from "lucide-react";

interface RetrievalResult {
  id: string | number;
  title: string;
  content: string;
  score: number;
  source: string;
}

interface RetrieverViewerProps {
  results?: RetrievalResult[];
}

const defaultResults: RetrievalResult[] = [
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

export default function RetrieverViewer({
  results = [],
}: RetrieverViewerProps) {
  const data = results.length > 0 ? results : defaultResults;

  const getScoreColor = (score: number): string => {
    if (score >= 0.85) return "#15803d";
    if (score >= 0.65) return "#b45309";
    return "#dc2626";
  };

  const getScoreBackground = (score: number): string => {
    if (score >= 0.85) return "#dcfce7";
    if (score >= 0.65) return "#fef3c7";
    return "#fee2e2";
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 0.85) return "High relevance";
    if (score >= 0.65) return "Moderate relevance";
    return "Low relevance";
  };

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
              borderRadius: "11px",
              background: "#eff6ff",
              color: "#2563eb",
            }}
          >
            <Database size={21} />
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Retrieved Results
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Information retrieved from your knowledge base.
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
          {data.length} {data.length === 1 ? "Result" : "Results"}
        </span>
      </div>

      {/* Results */}
      {data.length > 0 ? (
        <div
          style={{
            display: "grid",
            gap: "14px",
            marginTop: "22px",
          }}
        >
          {data.map((result) => {
            const safeScore = Number.isFinite(result.score)
              ? Math.min(Math.max(result.score, 0), 1)
              : 0;

            const percentage = safeScore * 100;

            return (
              <article
                key={result.id}
                style={{
                  padding: "17px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "11px",
                  background: "#ffffff",
                }}
              >
                {/* Result heading */}
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
                    <FileText
                      size={18}
                      color="#64748b"
                    />

                    <h3
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: 650,
                        color: "#1e293b",
                      }}
                    >
                      {result.title}
                    </h3>
                  </div>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 9px",
                      borderRadius: "7px",
                      background: getScoreBackground(safeScore),
                      color: getScoreColor(safeScore),
                      fontSize: "12px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <CheckCircle2 size={13} />
                    {percentage.toFixed(0)}%
                  </span>
                </div>

                {/* Relevance */}
                <div
                  style={{
                    marginTop: "14px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                      }}
                    >
                      Relevance score
                    </span>

                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: getScoreColor(safeScore),
                      }}
                    >
                      {getScoreLabel(safeScore)}
                    </span>
                  </div>

                  <div
                    style={{
                      height: "6px",
                      width: "100%",
                      background: "#f1f5f9",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${percentage}%`,
                        background: getScoreColor(safeScore),
                        borderRadius: "10px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Content */}
                <p
                  style={{
                    margin: "12px 0 15px",
                    color: "#475569",
                    fontSize: "13px",
                    lineHeight: 1.7,
                    overflowWrap: "anywhere",
                  }}
                >
                  {result.content}
                </p>

                {/* Source */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    paddingTop: "11px",
                    borderTop: "1px solid #f1f5f9",
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  <FileText size={14} />

                  <span>Source:</span>

                  <span
                    style={{
                      color: "#334155",
                      fontWeight: 600,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {result.source}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: "35px 15px",
            marginTop: "20px",
            textAlign: "center",
            background: "#f8fafc",
            border: "1px dashed #cbd5e1",
            borderRadius: "11px",
          }}
        >
          <Search
            size={25}
            color="#94a3b8"
          />

          <p
            style={{
              margin: "10px 0 5px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#334155",
            }}
          >
            No retrieved results
          </p>

          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            Run a knowledge-base search to view relevant documents.
          </p>
        </div>
      )}
    </section>
  );
}