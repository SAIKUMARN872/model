export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;

  if (typeof value === "string") return value.trim().length === 0;

  if (Array.isArray(value)) return value.length === 0;

  if (typeof value === "object") return Object.keys(value).length === 0;

  return false;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

export const clamp = (
  value: number,
  min: number,
  max: number
): number => Math.min(Math.max(value, min), max);