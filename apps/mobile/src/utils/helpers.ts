export function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2, 10)
  );
}

export function isEmpty(
  value: unknown
): boolean {
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
    value !== null
  ) {
    return Object.keys(value).length === 0;
  }

  return false;
}

export function capitalize(
  value: string
): string {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

export function truncate(
  value: string,
  maxLength: number
): string {
  if (value.length <= maxLength) {
    return value;
  }

  return (
    value.substring(0, maxLength) +
    "..."
  );
}

export function formatDate(
  value: string | Date
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString();
}

export function formatDateTime(
  value: string | Date
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString();
}

export function sleep(
  milliseconds: number
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(
      resolve,
      milliseconds
    );
  });
}

export function debounce<
  T extends (...args: any[]) => void
>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId:
    | ReturnType<typeof setTimeout>
    | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

export function isValidEmail(
  email: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

export function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(
    Math.max(value, min),
    max
  );
}