"use client";

/**
 * Check whether a value is empty.
 */
export function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (
    typeof value === "object" &&
    Object.keys(value).length === 0
  ) {
    return true;
  }

  return false;
}

/**
 * Check whether a value is a valid email.
 */
export function isValidEmail(email) {
  if (!email) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

/**
 * Safely parse JSON.
 */
export function parseJSON(
  value,
  fallback = null
) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * Safely stringify JSON.
 */
export function stringifyJSON(
  value,
  fallback = ""
) {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

/**
 * Get a value from localStorage.
 */
export function getStorageItem(
  key,
  fallback = null
) {
  if (
    typeof window === "undefined"
  ) {
    return fallback;
  }

  try {
    const value =
      localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return parseJSON(
      value,
      value
    );
  } catch {
    return fallback;
  }
}

/**
 * Save a value to localStorage.
 */
export function setStorageItem(
  key,
  value
) {
  if (
    typeof window === "undefined"
  ) {
    return false;
  }

  try {
    const data =
      typeof value === "string"
        ? value
        : JSON.stringify(value);

    localStorage.setItem(
      key,
      data
    );

    return true;
  } catch {
    return false;
  }
}

/**
 * Remove an item from localStorage.
 */
export function removeStorageItem(
  key
) {
  if (
    typeof window === "undefined"
  ) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format a number.
 */
export function formatNumber(
  value,
  options = {}
) {
  const number =
    Number(value);

  if (Number.isNaN(number)) {
    return "0";
  }

  return new Intl.NumberFormat(
    "en-IN",
    options
  ).format(number);
}

/**
 * Format currency.
 */
export function formatCurrency(
  value,
  currency = "INR"
) {
  const number =
    Number(value);

  if (Number.isNaN(number)) {
    return "₹0.00";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency,
    }
  ).format(number);
}

/**
 * Format date.
 */
export function formatDate(
  date,
  options = {}
) {
  if (!date) {
    return "";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    options
  ).format(parsedDate);
}

/**
 * Format relative time.
 */
export function formatRelativeTime(
  date
) {
  if (!date) {
    return "";
  }

  const timestamp =
    new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return "";
  }

  const difference =
    Date.now() - timestamp;

  const seconds = Math.floor(
    difference / 1000
  );

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  return `${days} day${
    days === 1 ? "" : "s"
  } ago`;
}

/**
 * Create a unique ID.
 */
export function generateId(
  prefix = "id"
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}

/**
 * Capitalize the first letter.
 */
export function capitalize(
  value
) {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

/**
 * Convert text to title case.
 */
export function toTitleCase(
  value
) {
  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .split(" ")
    .map(capitalize)
    .join(" ");
}

/**
 * Truncate text.
 */
export function truncate(
  value,
  maxLength = 100
) {
  if (!value) {
    return "";
  }

  if (
    value.length <= maxLength
  ) {
    return value;
  }

  return `${value.substring(
    0,
    maxLength
  )}...`;
}

/**
 * Combine class names.
 */
export function cn(
  ...classes
) {
  return classes
    .filter(Boolean)
    .join(" ");
}

/**
 * Debounce a function.
 */
export function debounce(
  callback,
  delay = 300
) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

/**
 * Sleep for a specific duration.
 */
export function sleep(
  milliseconds
) {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        milliseconds
      )
  );
}

/**
 * Check whether a value is an object.
 */
export function isObject(
  value
) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

/**
 * Safely get nested object value.
 */
export function getNestedValue(
  object,
  path,
  fallback = null
) {
  if (!object || !path) {
    return fallback;
  }

  const result = path
    .split(".")
    .reduce(
      (current, key) =>
        current?.[key],
      object
    );

  return result ?? fallback;
}

/**
 * Convert an object to query parameters.
 */
export function buildQueryString(
  params = {}
) {
  const query =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(
          key,
          String(value)
        );
      }
    }
  );

  const result =
    query.toString();

  return result
    ? `?${result}`
    : "";
}

/**
 * Download text as a file.
 */
export function downloadTextFile(
  content,
  filename = "download.txt"
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const blob = new Blob(
    [content],
    {
      type: "text/plain",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export default {
  isEmpty,
  isValidEmail,
  parseJSON,
  stringifyJSON,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  generateId,
  capitalize,
  toTitleCase,
  truncate,
  cn,
  debounce,
  sleep,
  isObject,
  getNestedValue,
  buildQueryString,
  downloadTextFile,
};