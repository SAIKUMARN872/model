import React from "react";
import {
  Bot,
  LoaderCircle,
  Radio,
  CheckCircle2,
} from "lucide-react";

interface StreamResponseProps {
  content?: string;
  isStreaming?: boolean;
}

export default function StreamResponse({
  content = "",
  isStreaming = false,
}: StreamResponseProps) {
  return (
    <section
      style={{
        width: "100%",
        padding: "20px",
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#eff6ff",
              color: "#2563eb",
              borderRadius: "10px",
            }}
          >
            <Bot size={20} />
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
              AI Response
            </h3>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Live response output
            </p>
          </div>
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 10px",
            borderRadius: "7px",
            background: isStreaming ? "#eff6ff" : "#f0fdf4",
            color: isStreaming ? "#2563eb" : "#15803d",
            fontSize: "12px",
            fontWeight: 600,
          }}
          role="status"
          aria-live="polite"
        >
          {isStreaming ? (
            <>
              <LoaderCircle
                size={14}
                style={{
                  animation: "stream-spin 1s linear infinite",
                }}
              />
              Generating...
            </>
          ) : (
            <>
              <CheckCircle2 size={14} />
              {content ? "Completed" : "Waiting"}
            </>
          )}
        </span>
      </div>

      {/* Response content */}
      <div
        style={{
          minHeight: "90px",
          padding: "16px",
          background: "#f8fafc",
          border: "1px solid #f1f5f9",
          borderRadius: "10px",
          color: "#334155",
          fontSize: "14px",
          lineHeight: 1.75,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {content ? (
          <>
            {content}

            {isStreaming && (
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: "7px",
                  height: "17px",
                  marginLeft: "4px",
                  verticalAlign: "middle",
                  background: "#2563eb",
                  borderRadius: "2px",
                  animation: "stream-blink 1s step-end infinite",
                }}
              />
            )}
          </>
        ) : (
          <div
            style={{
              minHeight: "58px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            {isStreaming && <Radio size={17} />}
            {isStreaming
              ? "Waiting for incoming response..."
              : "Your AI response will appear here."}
          </div>
        )}
      </div>

      <style>{`
        @keyframes stream-blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }

        @keyframes stream-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .stream-response-animation {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}