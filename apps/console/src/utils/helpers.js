"use strict";

/**
 * =========================================================
 * Console Helpers
 * ========================================================= */

/**
 * Safely get a nested property from an object.
 *
 * @param {Object} object
 * @param {string} path
 * @param {*} defaultValue
 * @returns {*}
 */
export function getNestedValue(
  object,
  path,
  defaultValue = undefined
) {
  if (!object || !path) {
    return defaultValue;
  }

  const keys = Array.isArray(path)
    ? path
    : path.split(".");

  let result = object;

  for (const key of keys) {
    if (
      result === null ||
      result === undefined ||
      !(key in Object(result))
    ) {
      return defaultValue;
    }

    result = result[key];
  }

  return result === undefined
    ? defaultValue
    : result;
}

/**
 * Safely check whether a value exists.
 *
 * @param {*} value
 * @returns {boolean}
 */
export function isDefined(value) {
  return (
    value !== null &&
    value !== undefined
  );
}

/**
 * Check whether a value is empty.
 *
 * @param {*} value
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return true;
  }

  if (
    typeof value === "string"
  ) {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (
    typeof value === "object"
  ) {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * Convert a value to a safe number.
 *
 * @param {*} value
 * @param {number} fallback
 * @returns {number}
 */
export function toNumber(
  value,
  fallback = 0
) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

/**
 * Format a number with Indian locale.
 *
 * @param {*} value
 * @param {Object} options
 * @returns {string}
 */
export function formatNumber(
  value,
  options = {}
) {
  const number = toNumber(value);

  return new Intl.NumberFormat(
    "en-IN",
    options
  ).format(number);
}

/**
 * Format a currency value.
 *
 * @param {*} value
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrency(
  value,
  currency = "USD"
) {
  const number = toNumber(value);

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }
  ).format(number);
}

/**
 * Format compact numbers.
 *
 * Examples:
 * 1000 -> 1K
 * 1000000 -> 1M
 *
 * @param {*} value
 * @returns {string}
 */
export function formatCompactNumber(
  value
) {
  const number = toNumber(value);

  return new Intl.NumberFormat(
    "en-IN",
    {
      notation: "compact",
      maximumFractionDigits: 1,
    }
  ).format(number);
}

/**
 * Format percentage.
 *
 * @param {*} value
 * @param {number} maximumFractionDigits
 * @returns {string}
 */
export function formatPercentage(
  value,
  maximumFractionDigits = 2
) {
  const number = toNumber(value);

  return `${number.toFixed(
    maximumFractionDigits
  )}%`;
}

/**
 * Calculate percentage change.
 *
 * @param {number} current
 * @param {number} previous
 * @returns {number}
 */
export function calculatePercentageChange(
  current,
  previous
) {
  const currentValue =
    toNumber(current);

  const previousValue =
    toNumber(previous);

  if (previousValue === 0) {
    if (currentValue === 0) {
      return 0;
    }

    return 100;
  }

  return (
    ((currentValue - previousValue) /
      Math.abs(previousValue)) *
    100
  );
}

/**
 * Format percentage change.
 *
 * @param {number} current
 * @param {number} previous
 * @returns {string}
 */
export function formatPercentageChange(
  current,
  previous
) {
  const change =
    calculatePercentageChange(
      current,
      previous
    );

  const sign =
    change > 0
      ? "+"
      : "";

  return `${sign}${change.toFixed(
    2
  )}%`;
}

/**
 * Get trend from two values.
 *
 * @param {number} current
 * @param {number} previous
 * @returns {"increase"|"decrease"|"neutral"}
 */
export function getTrend(
  current,
  previous
) {
  const currentValue =
    toNumber(current);

  const previousValue =
    toNumber(previous);

  if (currentValue > previousValue) {
    return "increase";
  }

  if (currentValue < previousValue) {
    return "decrease";
  }

  return "neutral";
}

/**
 * Clamp a number between minimum and maximum.
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(
  value,
  min,
  max
) {
  const number =
    toNumber(value);

  return Math.min(
    Math.max(number, min),
    max
  );
}

/**
 * Calculate percentage progress.
 *
 * @param {number} used
 * @param {number} total
 * @returns {number}
 */
export function calculateProgress(
  used,
  total
) {
  const usedValue =
    toNumber(used);

  const totalValue =
    toNumber(total);

  if (totalValue <= 0) {
    return 0;
  }

  return clamp(
    (usedValue / totalValue) * 100,
    0,
    100
  );
}

/**
 * Format date.
 *
 * @param {*} value
 * @param {Object} options
 * @returns {string}
 */
export function formatDate(
  value,
  options = {}
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    options
  ).format(date);
}

/**
 * Format date and time.
 *
 * @param {*} value
 * @returns {string}
 */
export function formatDateTime(
  value
) {
  if (!value) {
    return "-";
  }

  return formatDate(
    value,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

/**
 * Format relative time.
 *
 * @param {*} value
 * @returns {string}
 */
export function formatRelativeTime(
  value
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  const now =
    Date.now();

  const difference =
    date.getTime() - now;

  const seconds =
    Math.round(
      difference / 1000
    );

  const absSeconds =
    Math.abs(seconds);

  let unit = "second";
  let amount = seconds;

  if (absSeconds >= 86400) {
    unit = "day";
    amount =
      Math.round(
        seconds / 86400
      );
  } else if (absSeconds >= 3600) {
    unit = "hour";
    amount =
      Math.round(
        seconds / 3600
      );
  } else if (absSeconds >= 60) {
    unit = "minute";
    amount =
      Math.round(
        seconds / 60
      );
  }

  const formatter =
    new Intl.RelativeTimeFormat(
      "en-IN",
      {
        numeric: "auto",
      }
    );

  return formatter.format(
    amount,
    unit
  );
}

/**
 * Convert bytes to readable size.
 *
 * @param {*} bytes
 * @param {number} decimals
 * @returns {string}
 */
export function formatBytes(
  bytes,
  decimals = 2
) {
  const value =
    toNumber(bytes);

  if (value === 0) {
    return "0 Bytes";
  }

  const base = 1024;

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
    "PB",
  ];

  const index =
    Math.floor(
      Math.log(value) /
        Math.log(base)
    );

  const safeIndex =
    Math.min(
      index,
      units.length - 1
    );

  const result =
    value /
    Math.pow(
      base,
      safeIndex
    );

  return `${parseFloat(
    result.toFixed(decimals)
  )} ${units[safeIndex]}`;
}

/**
 * Format token count.
 *
 * @param {*} tokens
 * @returns {string}
 */
export function formatTokens(
  tokens
) {
  return formatCompactNumber(
    tokens
  );
}

/**
 * Format latency.
 *
 * @param {*} milliseconds
 * @returns {string}
 */
export function formatLatency(
  milliseconds
) {
  const value =
    toNumber(milliseconds);

  if (value < 1000) {
    return `${Math.round(
      value
    )} ms`;
  }

  return `${(
    value / 1000
  ).toFixed(2)} s`;
}

/**
 * Format duration.
 *
 * @param {*} milliseconds
 * @returns {string}
 */
export function formatDuration(
  milliseconds
) {
  const value =
    toNumber(milliseconds);

  if (value < 1000) {
    return `${Math.round(
      value
    )} ms`;
  }

  const seconds =
    Math.floor(
      value / 1000
    );

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  const remainingSeconds =
    seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const remainingMinutes =
    minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Capitalize first letter.
 *
 * @param {*} value
 * @returns {string}
 */
export function capitalize(
  value
) {
  if (!value) {
    return "";
  }

  const string =
    String(value);

  return (
    string.charAt(0).toUpperCase() +
    string.slice(1)
  );
}

/**
 * Convert snake_case or kebab-case
 * to readable text.
 *
 * @param {*} value
 * @returns {string}
 */
export function humanize(
  value
) {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim()
    .split(" ")
    .map(capitalize)
    .join(" ");
}

/**
 * Create initials from a name.
 *
 * @param {*} name
 * @returns {string}
 */
export function getInitials(
  name
) {
  if (!name) {
    return "?";
  }

  const words =
    String(name)
      .trim()
      .split(/\s+/);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[
      words.length - 1
    ].charAt(0)
  ).toUpperCase();
}

/**
 * Truncate text.
 *
 * @param {*} value
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(
  value,
  maxLength = 100
) {
  if (!value) {
    return "";
  }

  const string =
    String(value);

  if (
    string.length <=
    maxLength
  ) {
    return string;
  }

  return (
    string.slice(
      0,
      Math.max(
        0,
        maxLength - 3
      )
    ) + "..."
  );
}

/**
 * Create a URL query string.
 *
 * @param {Object} params
 * @returns {string}
 */
export function buildQueryString(
  params = {}
) {
  const searchParams =
    new URLSearchParams();

  Object.entries(params)
    .forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          if (
            Array.isArray(value)
          ) {
            value.forEach(
              (item) => {
                searchParams.append(
                  key,
                  String(item)
                );
              }
            );
          } else {
            searchParams.set(
              key,
              String(value)
            );
          }
        }
      }
    );

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
}

/**
 * Parse query parameters.
 *
 * @param {string} search
 * @returns {Object}
 */
export function parseQueryString(
  search = ""
) {
  const query =
    search.startsWith("?")
      ? search.slice(1)
      : search;

  const params =
    new URLSearchParams(
      query
    );

  const result = {};

  params.forEach(
    (value, key) => {
      if (
        Object.prototype.hasOwnProperty.call(
          result,
          key
        )
      ) {
        if (
          Array.isArray(
            result[key]
          )
        ) {
          result[key].push(
            value
          );
        } else {
          result[key] = [
            result[key],
            value,
          ];
        }
      } else {
        result[key] = value;
      }
    }
  );

  return result;
}

/**
 * Debounce a function.
 *
 * @param {Function} callback
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(
  callback,
  delay = 300
) {
  let timeoutId;

  return function debounced(
    ...args
  ) {
    clearTimeout(
      timeoutId
    );

    timeoutId =
      setTimeout(
        () => {
          callback.apply(
            this,
            args
          );
        },
        delay
      );
  };
}

/**
 * Throttle a function.
 *
 * @param {Function} callback
 * @param {number} limit
 * @returns {Function}
 */
export function throttle(
  callback,
  limit = 300
) {
  let waiting = false;

  return function throttled(
    ...args
  ) {
    if (waiting) {
      return;
    }

    callback.apply(
      this,
      args
    );

    waiting = true;

    setTimeout(
      () => {
        waiting = false;
      },
      limit
    );
  };
}

/**
 * Create a unique ID.
 *
 * @param {string} prefix
 * @returns {string}
 */
export function createId(
  prefix = "id"
) {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

/**
 * Deep clone a simple object.
 *
 * @param {*} value
 * @returns {*}
 */
export function deepClone(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return value;
  }

  try {
    return JSON.parse(
      JSON.stringify(value)
    );
  } catch {
    return value;
  }
}

/**
 * Remove undefined and null values
 * from an object.
 *
 * @param {Object} object
 * @returns {Object}
 */
export function removeEmptyValues(
  object = {}
) {
  return Object.fromEntries(
    Object.entries(object)
      .filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ""
      )
  );
}

/**
 * Sort an array by a property.
 *
 * @param {Array} items
 * @param {string} property
 * @param {"asc"|"desc"} direction
 * @returns {Array}
 */
export function sortBy(
  items = [],
  property,
  direction = "asc"
) {
  if (
    !Array.isArray(items)
  ) {
    return [];
  }

  return [...items].sort(
    (a, b) => {
      const first =
        getNestedValue(
          a,
          property
        );

      const second =
        getNestedValue(
          b,
          property
        );

      if (
        first === second
      ) {
        return 0;
      }

      if (
        first === undefined ||
        first === null
      ) {
        return 1;
      }

      if (
        second === undefined ||
        second === null
      ) {
        return -1;
      }

      const comparison =
        String(first)
          .toLowerCase()
          .localeCompare(
            String(second)
              .toLowerCase()
          );

      return direction === "desc"
        ? -comparison
        : comparison;
    }
  );
}

/**
 * Filter an array by search text.
 *
 * @param {Array} items
 * @param {string} search
 * @param {string[]} properties
 * @returns {Array}
 */
export function searchItems(
  items = [],
  search = "",
  properties = []
) {
  if (
    !Array.isArray(items)
  ) {
    return [];
  }

  const query =
    String(search)
      .trim()
      .toLowerCase();

  if (!query) {
    return items;
  }

  return items.filter(
    (item) =>
      properties.some(
        (property) => {
          const value =
            getNestedValue(
              item,
              property,
              ""
            );

          return String(value)
            .toLowerCase()
            .includes(query);
        }
      )
  );
}

/**
 * Get a safe status class.
 *
 * @param {*} status
 * @returns {string}
 */
export function getStatusClass(
  status
) {
  if (!status) {
    return "neutral";
  }

  return String(status)
    .toLowerCase()
    .replace(
      /[\s_]+/g,
      "-"
    );
}

/**
 * Check whether a response
 * represents a successful request.
 *
 * @param {Object} response
 * @returns {boolean}
 */
export function isSuccessResponse(
  response
) {
  if (!response) {
    return false;
  }

  if (
    response.success === true
  ) {
    return true;
  }

  const status =
    response.status ??
    response.statusCode;

  return (
    typeof status === "number" &&
    status >= 200 &&
    status < 300
  );
}

/**
 * Extract API error message.
 *
 * @param {*} error
 * @param {string} fallback
 * @returns {string}
 */
export function getErrorMessage(
  error,
  fallback = "Something went wrong"
) {
  if (!error) {
    return fallback;
  }

  if (
    typeof error === "string"
  ) {
    return error;
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

/**
 * Create a safe error object.
 *
 * @param {*} error
 * @returns {Object}
 */
export function normalizeError(
  error
) {
  return {
    message:
      getErrorMessage(error),

    status:
      error?.response?.status ??
      error?.status ??
      500,

    code:
      error?.response?.data?.code ??
      error?.code ??
      "UNKNOWN_ERROR",

    details:
      error?.response?.data?.details ??
      error?.details ??
      null,
  };
}

/**
 * Check whether a value is a valid email.
 *
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(
  email
) {
  if (!email) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email).trim()
  );
}

/**
 * Check whether a value is a valid URL.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isValidUrl(
  value
) {
  if (!value) {
    return false;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert an object to JSON safely.
 *
 * @param {*} value
 * @param {string} fallback
 * @returns {string}
 */
export function safeJsonStringify(
  value,
  fallback = "{}"
) {
  try {
    return JSON.stringify(
      value
    );
  } catch {
    return fallback;
  }
}

/**
 * Parse JSON safely.
 *
 * @param {string} value
 * @param {*} fallback
 * @returns {*}
 */
export function safeJsonParse(
  value,
  fallback = null
) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(
      value
    );
  } catch {
    return fallback;
  }
}

/**
 * Convert value to an array.
 *
 * @param {*} value
 * @returns {Array}
 */
export function ensureArray(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return [];
  }

  return Array.isArray(value)
    ? value
    : [value];
}

/**
 * Export all helpers as default.
 */
export default {
  getNestedValue,
  isDefined,
  isEmpty,

  toNumber,
  formatNumber,
  formatCurrency,
  formatCompactNumber,
  formatPercentage,

  calculatePercentageChange,
  formatPercentageChange,
  getTrend,

  clamp,
  calculateProgress,

  formatDate,
  formatDateTime,
  formatRelativeTime,

  formatBytes,
  formatTokens,
  formatLatency,
  formatDuration,

  capitalize,
  humanize,
  getInitials,
  truncate,

  buildQueryString,
  parseQueryString,

  debounce,
  throttle,

  createId,
  deepClone,
  removeEmptyValues,

  sortBy,
  searchItems,

  getStatusClass,

  isSuccessResponse,
  getErrorMessage,
  normalizeError,

  isValidEmail,
  isValidUrl,

  safeJsonStringify,
  safeJsonParse,

  ensureArray,
};