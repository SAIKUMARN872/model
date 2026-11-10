import React, { useEffect, useState } from "react";

function safeString(value, fallback) {
  try {
    return value == null ? fallback : String(value);
  } catch {
    return fallback;
  }
}

function formatResponse(response) {
  if (typeof response === "string") return response;
  if (response == null) return "";

  try {
    const serialized = JSON.stringify(response, null, 2);
    if (typeof serialized === "string") return serialized;
  } catch {
    // Fall through to a guarded string conversion.
  }

  return safeString(response, "[Response could not be serialized.]");
}

export default function ResponseViewer({
  response = "",
  loading = false,
  error,
  onCopy,
  className,
}) {
  const [copyStatus, setCopyStatus] = useState("");
  const text = formatResponse(response);
  const canCopy = typeof onCopy === "function";
  const isLoading = loading === true;

  useEffect(() => {
    setCopyStatus("");
  }, [text, error, isLoading]);

  async function copy() {
    if (!text || isLoading) return;

    setCopyStatus("");

    try {
      if (canCopy) {
        await onCopy(text);
      } else if (globalThis.navigator?.clipboard?.writeText) {
        await globalThis.navigator.clipboard.writeText(text);
      } else {
        setCopyStatus("Clipboard access is unavailable in this browser context.");
        return;
      }

      setCopyStatus("Copied to clipboard.");
    } catch {
      setCopyStatus("Copy failed. Check browser clipboard permissions and try again.");
    }
  }

  return (
    <section
      className={className}
      style={{
        minWidth: 0,
        border: "1px solid var(--line, #e5e5e5)",
        borderRadius: 12,
        padding: 16,
        background: "#ffffff",
        color: "#171717",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Response</h3>
        <button
          className="button button--secondary"
          type="button"
          disabled={!text || isLoading}
          onClick={copy}
        >
          Copy
        </button>
      </header>

      {isLoading ? (
        <p role="status">Waiting for response…</p>
      ) : error ? (
        <p role="alert">{safeString(error, "An unexpected error occurred.")}</p>
      ) : (
        <pre
          style={{
            margin: 0,
            minHeight: 180,
            maxHeight: 520,
            overflow: "auto",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
            fontSize: 12,
            lineHeight: 1.7,
          }}
        >
          {text || "The actual API response will appear here."}
        </pre>
      )}

      <p
        aria-live="polite"
        role="status"
        style={{ minHeight: 18, margin: "10px 0 0", fontSize: 12, color: "#525252" }}
      >
        {copyStatus}
      </p>
    </section>
  );
}