import React from "react";

const DEFAULT_MAX_LENGTH = 100000;
const MAX_ALLOWED_LENGTH = 1000000;

function boundedInteger(input, fallback, min, max) {
  const parsed = typeof input === "number" || typeof input === "string"
    ? Number(input)
    : NaN;

  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

export default function PromptEditor({
  value = "",
  onChange,
  label = "Prompt",
  placeholder = "Enter your prompt…",
  rows = 8,
  disabled = false,
  maxLength = DEFAULT_MAX_LENGTH,
  className,
}) {
  const generatedId = React.useId();
  const text = typeof value === "string" ? value : "";
  const safeLabel = typeof label === "string" ? label : "Prompt";
  const safePlaceholder = typeof placeholder === "string" ? placeholder : "";
  const safeRows = boundedInteger(rows, 8, 1, 40);
  const safeMaxLength = boundedInteger(
    maxLength,
    DEFAULT_MAX_LENGTH,
    1,
    MAX_ALLOWED_LENGTH,
  );
  const canChange = typeof onChange === "function";
  const isDisabled = disabled === true || !canChange;

  const handleChange = event => {
    if (!canChange || disabled === true) return;

    const nextText = typeof event?.target?.value === "string"
      ? event.target.value.slice(0, safeMaxLength)
      : text;

    onChange(nextText);
  };

  return (
    <div className={className} style={{ display: "grid", gap: 7, minWidth: 0 }}>
      <label htmlFor={generatedId} style={{ fontSize: 13, fontWeight: 600 }}>
        {safeLabel}
      </label>
      <textarea
        id={generatedId}
        value={text}
        onChange={handleChange}
        placeholder={safePlaceholder}
        rows={safeRows}
        maxLength={safeMaxLength}
        disabled={isDisabled}
        spellCheck
        style={{
          boxSizing: "border-box",
          width: "100%",
          resize: "vertical",
          padding: 12,
          border: "1px solid var(--line, #374151)",
          borderRadius: 10,
          background: "#ffffff",
          color: "#171717",
          font: "inherit",
          lineHeight: 1.55,
        }}
      />
      <span style={{ fontSize: 11, opacity: 0.7 }} aria-live="polite">
        {text.length.toLocaleString()} / {safeMaxLength.toLocaleString()} characters
      </span>
    </div>
  );
}