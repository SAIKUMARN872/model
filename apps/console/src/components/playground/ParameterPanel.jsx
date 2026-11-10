import React from "react";

const DEFAULTS = Object.freeze({
  temperature: 0.7,
  topP: 1,
  maxTokens: 1024,
});

function boundedNumber(input, fallback, min, max, integer = false) {
  const parsed = typeof input === "number" || typeof input === "string"
    ? Number(input)
    : NaN;

  if (!Number.isFinite(parsed)) return fallback;

  const bounded = Math.min(max, Math.max(min, parsed));
  return integer ? Math.round(bounded) : bounded;
}

export default function ParameterPanel({ value = {}, onChange, disabled = false, className }) {
  const supplied = value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};

  const p = {
    temperature: boundedNumber(supplied.temperature, DEFAULTS.temperature, 0, 2),
    topP: boundedNumber(supplied.topP, DEFAULTS.topP, 0.05, 1),
    maxTokens: boundedNumber(supplied.maxTokens, DEFAULTS.maxTokens, 1, 200000, true),
  };

  const canChange = typeof onChange === "function";
  const isDisabled = disabled === true || !canChange;

  const update = (key, input) => {
    if (!canChange || disabled === true) return;

    let nextValue;
    if (key === "temperature") {
      nextValue = boundedNumber(input, p.temperature, 0, 2);
    } else if (key === "topP") {
      nextValue = boundedNumber(input, p.topP, 0.05, 1);
    } else if (key === "maxTokens") {
      nextValue = boundedNumber(input, p.maxTokens, 1, 200000, true);
    } else {
      return;
    }

    onChange({ ...p, [key]: nextValue });
  };

  return <section className={className} style={{ display: "grid", gap: 16 }}>
    <h3 style={{ margin: 0, fontSize: 14 }}>Generation parameters</h3>
    <label style={{ display: "grid", gap: 7, fontSize: 13 }}>Temperature: {p.temperature}
      <input
        type="range"
        min="0"
        max="2"
        step=".1"
        value={p.temperature}
        disabled={isDisabled}
        onChange={event => update("temperature", event.target.value)}
      />
    </label>
    <label style={{ display: "grid", gap: 7, fontSize: 13 }}>Top P: {p.topP}
      <input
        type="range"
        min=".05"
        max="1"
        step=".05"
        value={p.topP}
        disabled={isDisabled}
        onChange={event => update("topP", event.target.value)}
      />
    </label>
    <label style={{ display: "grid", gap: 7, fontSize: 13 }}>Maximum output tokens
      <input
        type="number"
        min="1"
        max="200000"
        step="1"
        value={p.maxTokens}
        disabled={isDisabled}
        onChange={event => update("maxTokens", event.target.value)}
        style={{ padding: 9 }}
      />
    </label>
  </section>;
}