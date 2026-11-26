import { useState } from "react";
import {
  Bot,
  Copy,
  Check,
  Clock3,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

interface ResponseViewerProps {
  response?: string;
  title?: string;
  status?: string;
}

export default function ResponseViewer({
  response = "",
  title = "AI Response",
  status = "Waiting",
}: ResponseViewerProps) {
  const [copied, setCopied] = useState(false);

  const completed = status.toLowerCase() === "completed";
  const running = status.toLowerCase() === "running";
  const failed = status.toLowerCase() === "failed";

  const handleCopy = async (): Promise<void> => {
    if (!response.trim()) return;

    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  const getStatusIcon = () => {
    if (completed) return <CheckCircle2 size={14} />;
    if (running) return <LoaderCircle size={14} />;
    if (failed) return <AlertCircle size={14} />;
    return <Clock3 size={14} />;
  };

  return (
    <section className="chat-card response-viewer-card">
      <div className="response-viewer-heading">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              background: "#eff6ff",
              color: "#2563eb",
            }}
          >
            <Bot size={20} />
          </div>

          <div>
            <h2>{title}</h2>
            <span
              style={{
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Generated output
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {response.trim() && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy AI response"
              title="Copy response"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 10px",
                border: "1px solid #e2e8f0",
                borderRadius: "7px",
                background: "#ffffff",
                color: "#475569",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}

          <span
            className={[
              "response-status",
              completed ? "response-status-completed" : "",
              running ? "response-status-running" : "",
              failed ? "response-status-failed" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            {getStatusIcon()}
            {status}
          </span>
        </div>
      </div>

      <div className="response-viewer-content">
        {response.trim() ? (
          <div
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              lineHeight: 1.75,
              color: "#334155",
              fontSize: "14px",
            }}
          >
            {response}
          </div>
        ) : (
          <div
            className="response-empty"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              minHeight: "150px",
              textAlign: "center",
            }}
          >
            <FileText size={27} />
            <span>Your latest AI response will appear here.</span>
            <span
              style={{
                fontSize: "12px",
                color: "#94a3b8",
              }}
            >
              Submit a prompt to generate a response.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}