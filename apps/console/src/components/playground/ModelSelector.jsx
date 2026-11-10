import React, { useEffect, useId, useState } from "react";

export default function ModelSelector({
  models = [],
  value = "",
  onChange,
  disabled = false,
  label = "Model",
  className,
}) {
  const inputId = useId();
  const safeValue = typeof value === "string" ? value : "";
  const safeLabel = typeof label === "string" && label.trim() ? label : "Model";
  const safeModels = (Array.isArray(models) ? models : [])
    .map((model) => {
      if (typeof model === "string") {
        const id = model.trim();
        return id ? { id, name: id, provider: "", disabled: false } : null;
      }
      if (!model || typeof model !== "object" || Array.isArray(model)) return null;

      const rawId = typeof model.id === "string" ? model.id : "";
      const rawName = typeof model.name === "string" ? model.name : "";
      const id = (rawId || rawName).trim();
      if (!id) return null;

      return {
        id,
        name: rawName.trim() || id,
        provider: typeof model.provider === "string" ? model.provider : "",
        disabled: model.disabled === true,
      };
    })
    .filter(Boolean)
    .filter((model, index, list) =>
      list.findIndex((candidate) => candidate.id === model.id) === index
    );

  const hasModels = safeModels.length > 0;
  const canChange = typeof onChange === "function";
  const [mode, setMode] = useState(safeValue.trim() ? "manual" : "auto");

  useEffect(() => {
    setMode(safeValue.trim() ? "manual" : "auto");
  }, [safeValue]);

  function changeMode(nextMode) {
    if (disabled) return;
    setMode(nextMode);
    if (nextMode === "auto" && canChange) {
      onChange("");
    }
  }

  return (
    <fieldset
      className={className}
      disabled={disabled}
      style={{
        display: "grid",
        gap: 12,
        minWidth: 0,
        margin: 0,
        padding: 0,
        border: 0,
      }}
    >
      <legend style={{ fontSize: 13, fontWeight: 650, marginBottom: 2 }}>
        {safeLabel}
      </legend>

      <div
        role="group"
        aria-label="Model routing mode"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        <button
          type="button"
          aria-pressed={mode === "auto"}
          onClick={() => changeMode("auto")}
          style={{
            padding: "10px 12px",
            border: "1px solid",
            borderColor: mode === "auto"
              ? "var(--accent, #6366f1)"
              : "var(--line, #374151)",
            borderRadius: 9,
            background: mode === "auto"
              ? "var(--accent-soft, rgba(99,102,241,.12))"
              : "var(--input, #0b1220)",
            color: "inherit",
            font: "inherit",
            cursor: disabled ? "not-allowed" : "pointer",
            textAlign: "left",
          }}
        >
          <span style={{ display: "block", fontWeight: 600 }}>
            Automatic
          </span>
          <span style={{ display: "block", marginTop: 3, fontSize: 11, opacity: 0.75 }}>
            Let ModelNow route
          </span>
        </button>

        <button
          type="button"
          aria-pressed={mode === "manual"}
          onClick={() => changeMode("manual")}
          style={{
            padding: "10px 12px",
            border: "1px solid",
            borderColor: mode === "manual"
              ? "var(--accent, #6366f1)"
              : "var(--line, #374151)",
            borderRadius: 9,
            background: mode === "manual"
              ? "var(--accent-soft, rgba(99,102,241,.12))"
              : "var(--input, #0b1220)",
            color: "inherit",
            font: "inherit",
            cursor: disabled ? "not-allowed" : "pointer",
            textAlign: "left",
          }}
        >
          <span style={{ display: "block", fontWeight: 600 }}>
            Manual
          </span>
          <span style={{ display: "block", marginTop: 3, fontSize: 11, opacity: 0.75 }}>
            Enter a model ID
          </span>
        </button>
      </div>

      {mode === "manual" && (
        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor={inputId} style={{ fontSize: 12 }}>
            Model ID
          </label>
          <input
            id={inputId}
            type="text"
            value={safeValue}
            onChange={(event) => {
              if (canChange) onChange(event.target.value);
            }}
            placeholder="Enter a supported model ID"
            maxLength={200}
            autoComplete="off"
            spellCheck={false}
            required={mode === "manual"}
            style={{
              boxSizing: "border-box",
              width: "100%",
              padding: 11,
              border: "1px solid var(--line, #374151)",
              borderRadius: 9,
              background: "#ffffff",
              color: "#171717",
              font: "inherit",
            }}
          />
          <span style={{ fontSize: 11, opacity: 0.75 }}>
            Enter the exact model ID supported by your ModelNow backend.
          </span>

          {hasModels && (
            <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
              Or choose a listed model
              <select
                value={safeModels.some((item) => item.id === safeValue) ? safeValue : ""}
                onChange={(event) => {
                  if (canChange) onChange(event.target.value);
                }}
                style={{
                  boxSizing: "border-box",
                  width: "100%",
                  padding: 10,
                  border: "1px solid var(--line, #374151)",
                  borderRadius: 9,
                  background: "#ffffff",
                  color: "#171717",
                  font: "inherit",
                }}
              >
                <option value="">Keep manually entered ID</option>
                {safeModels.map((model) => (
                  <option key={model.id} value={model.id} disabled={model.disabled}>
                    {model.name}{model.provider ? ` · ${model.provider}` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      {mode === "auto" && (
        <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>
          No model override will be sent. ModelNow will apply its server-side routing policy.
        </p>
      )}
    </fieldset>
  );
}