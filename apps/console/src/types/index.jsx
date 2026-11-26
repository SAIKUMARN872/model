/**
 * Runtime validators for JavaScript consumers. These checks improve input
 * hygiene but do not replace API schema validation or server authorization.
 */

export function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isFiniteNonNegativeNumber(value) {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0;
}

export function assertRecord(value, label = "value") {
  if (!isRecord(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value;
}

export function assertNonEmptyString(value, label = "value") {
  if (!isNonEmptyString(value)) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

export function assertStringArray(value, label = "value") {
  if (!Array.isArray(value) || !value.every(item => typeof item === "string")) {
    throw new TypeError(`${label} must be an array of strings.`);
  }
  return value;
}

export const CONSOLE_STATUSES = Object.freeze([
  "idle",
  "loading",
  "success",
  "error"
]);

export function isConsoleStatus(value) {
  return CONSOLE_STATUSES.includes(value);
}
