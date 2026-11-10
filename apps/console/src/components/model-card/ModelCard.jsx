import React from "react";

export default function ModelCard({ model = {}, onSelect, selected = false, disabled = false, className }) {
  const safeModel = model && typeof model === "object" && !Array.isArray(model) ? model : {};
  const displayText = value => typeof value === "string" && value.trim() ? value : null;
  const name = displayText(safeModel.name) || displayText(safeModel.id) || "Unnamed model";
  const provider = displayText(safeModel.provider);
  const description = displayText(safeModel.description);
  const rawContextLength = safeModel.contextLength;
  const contextLength = rawContextLength !== null && rawContextLength !== undefined &&
    rawContextLength !== "" && (typeof rawContextLength === "number" || typeof rawContextLength === "string")
    ? Number(rawContextLength)
    : NaN;
  const hasContextLength = Number.isSafeInteger(contextLength) && contextLength >= 0;
  const isSelected = selected === true;
  const isDisabled = disabled === true || typeof onSelect !== "function";

  return <article className={className} style={{ padding: 14, border: `1px solid ${isSelected ? "var(--accent, #818cf8)" : "var(--line, #293247)"}`, borderRadius: 12, minWidth: 0 }}>
    <h3 style={{ margin: 0, fontSize: 15, overflowWrap: "anywhere" }}>{name}</h3>
    {provider && <p style={{ fontSize: 12, opacity: .7 }}>{provider}</p>}
    {description && <p style={{ fontSize: 13, overflowWrap: "anywhere" }}>{description}</p>}
    {hasContextLength && <p style={{ fontSize: 12, opacity: .7 }}>Context: {contextLength.toLocaleString()} tokens</p>}
    <button type="button" disabled={isDisabled} aria-pressed={isSelected} onClick={() => {
      if (!isDisabled) onSelect(safeModel);
    }}>{isSelected ? "Selected" : "Select model"}</button>
  </article>;
}