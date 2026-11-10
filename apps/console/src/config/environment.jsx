const ENVIRONMENT_KEY_PATTERN = /^VITE_[A-Z0-9_]+$/;

export function getEnvironmentValue(name, fallback = "") {
  if (typeof name !== "string" || !ENVIRONMENT_KEY_PATTERN.test(name)) {
    throw new TypeError("A valid VITE_ environment variable name is required.");
  }

  const value = import.meta.env[name];
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : fallback;
}

export function requireEnvironmentValue(name) {
  const value = getEnvironmentValue(name);

  if (!value) {
    throw new Error(`Required environment variable ${name} is not configured.`);
  }

  return value;
}

export function getSameOriginPath(name, fallback = null) {
  const value = getEnvironmentValue(name, fallback ?? "");

  if (!value) return fallback;

  if (!value.startsWith("/") || value.startsWith("//") ||
      value.includes("\\") || /[\r\n]/.test(value)) {
    throw new Error(`${name} must be a same-origin path beginning with "/".`);
  }

  return value;
}
