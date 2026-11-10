import React from "react";

function normalizeSize(value) {
  const parsed = typeof value === "number" || typeof value === "string"
    ? Number(value)
    : NaN;

  if (!Number.isFinite(parsed)) return 24;

  return Math.max(12, Math.min(96, parsed));
}

export default function Spinner({ label = "Loading", size = 24, className }) {
  const px = normalizeSize(size);
  const safeLabel = typeof label === "string" ? label : "Loading";

  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
      }}
    >
      <span
        className="console-component-spinner-indicator"
        aria-hidden="true"
        style={{
          width: px,
          height: px,
          flexShrink: 0,
          boxSizing: "border-box",
          border: "2px solid currentColor",
          borderRightColor: "transparent",
          borderRadius: "50%",
          animation: "console-component-spin .8s linear infinite",
        }}
      />
      <span style={{ fontSize: 13 }}>{safeLabel}</span>
      <style>{`
        @keyframes console-component-spin {
          to { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .console-component-spinner-indicator {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}