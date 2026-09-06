/**
 * Global formatting utilities
 * Admin Dashboard
 */

/**
 * Format a number using the user's locale.
 *
 * Example:
 * formatNumber(125430)
 * => "125,430"
 */
export const formatNumber = (
  value,
  options = {}
) => {
  if (value === null || value === undefined) {
    return "0";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "0";
  }

  return new Intl.NumberFormat(
    "en-US",
    options
  ).format(number);
};

/**
 * Format a number using compact notation.
 *
 * Example:
 * formatCompactNumber(1250000)
 * => "1.3M"
 */
export const formatCompactNumber = (
  value,
  decimals = 1
) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "0";
  }

  const number = Number(value);

  if (number >= 1_000_000_000) {
    return `${(
      number / 1_000_000_000
    ).toFixed(decimals)}B`;
  }

  if (number >= 1_000_000) {
    return `${(
      number / 1_000_000
    ).toFixed(decimals)}M`;
  }

  if (number >= 1_000) {
    return `${(
      number / 1_000
    ).toFixed(decimals)}K`;
  }

  return number.toString();
};

/**
 * Format currency.
 *
 * Example:
 * formatCurrency(1250)
 * => "$1,250.00"
 */
export const formatCurrency = (
  value,
  currency = "USD"
) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "$0.00";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
    }
  ).format(Number(value));
};

/**
 * Format percentage.
 *
 * Example:
 * formatPercentage(75)
 * => "75%"
 */
export const formatPercentage = (
  value,
  decimals = 0
) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "0%";
  }

  return `${Number(value).toFixed(
    decimals
  )}%`;
};

/**
 * Format date.
 *
 * Example:
 * formatDate("2026-07-22")
 * => "Jul 22, 2026"
 */
export const formatDate = (
  value,
  options = {}
) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    }
  ).format(date);
};

/**
 * Format date and time.
 *
 * Example:
 * formatDateTime("2026-07-22T10:30:00")
 * => "Jul 22, 2026, 10:30 AM"
 */
export const formatDateTime = (
  value,
  options = {}
) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      ...options,
    }
  ).format(date);
};

/**
 * Format relative time.
 *
 * Example:
 * formatRelativeTime("2026-07-22T10:00:00")
 * => "2 hours ago"
 */
export const formatRelativeTime = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const now = new Date();

  const difference =
    date.getTime() - now.getTime();

  const seconds = Math.round(
    difference / 1000
  );

  const formatter =
    new Intl.RelativeTimeFormat(
      "en",
      {
        numeric: "auto",
      }
    );

  const intervals = [
    {
      unit: "year",
      seconds: 31536000,
    },
    {
      unit: "month",
      seconds: 2592000,
    },
    {
      unit: "week",
      seconds: 604800,
    },
    {
      unit: "day",
      seconds: 86400,
    },
    {
      unit: "hour",
      seconds: 3600,
    },
    {
      unit: "minute",
      seconds: 60,
    },
    {
      unit: "second",
      seconds: 1,
    },
  ];

  for (const interval of intervals) {
    if (
      Math.abs(seconds) >=
      interval.seconds
    ) {
      return formatter.format(
        Math.round(
          seconds / interval.seconds
        ),
        interval.unit
      );
    }
  }

  return "just now";
};

/**
 * Format file size.
 *
 * Example:
 * formatFileSize(1048576)
 * => "1 MB"
 */
export const formatFileSize = (
  bytes
) => {
  if (
    bytes === null ||
    bytes === undefined ||
    Number.isNaN(Number(bytes)) ||
    Number(bytes) === 0
  ) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index = Math.floor(
    Math.log(Number(bytes)) /
      Math.log(1024)
  );

  const size =
    Number(bytes) /
    Math.pow(1024, index);

  return `${size.toFixed(
    index === 0 ? 0 : 2
  )} ${units[index]}`;
};

/**
 * Convert a string to title case.
 *
 * Example:
 * toTitleCase("super_admin")
 * => "Super Admin"
 */
export const toTitleCase = (
  value
) => {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(
      /\w\S*/g,
      (word) =>
        word.charAt(0).toUpperCase() +
        word
          .slice(1)
          .toLowerCase()
    );
};

/**
 * Convert a string to a readable status.
 *
 * Example:
 * formatStatus("in_progress")
 * => "In Progress"
 */
export const formatStatus = (
  status
) => {
  if (!status) {
    return "Unknown";
  }

  return toTitleCase(status);
};

/**
 * Get initials from a name.
 *
 * Example:
 * getInitials("John Smith")
 * => "JS"
 */
export const getInitials = (
  name,
  maxInitials = 2
) => {
  if (!name) {
    return "";
  }

  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, maxInitials)
    .map((word) =>
      word.charAt(0).toUpperCase()
    )
    .join("");
};

/**
 * Truncate long text.
 *
 * Example:
 * truncateText("Hello World", 5)
 * => "Hello..."
 */
export const truncateText = (
  value,
  maxLength = 50
) => {
  if (!value) {
    return "";
  }

  const text = String(value);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(
    0,
    maxLength
  )}...`;
};

/**
 * Format API response status.
 *
 * Example:
 * formatHttpStatus(200)
 * => "Success"
 */
export const formatHttpStatus = (
  status
) => {
  const statusCode = Number(status);

  if (
    statusCode >= 200 &&
    statusCode < 300
  ) {
    return "Success";
  }

  if (
    statusCode >= 300 &&
    statusCode < 400
  ) {
    return "Redirect";
  }

  if (
    statusCode >= 400 &&
    statusCode < 500
  ) {
    return "Client Error";
  }

  if (statusCode >= 500) {
    return "Server Error";
  }

  return "Unknown";
};