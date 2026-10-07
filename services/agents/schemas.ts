export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  errors: string[];
}

export function success<T>(data: T): ValidationResult<T> {
  return {
    valid: true,
    data,
    errors: [],
  };
}

export function failure<T = never>(
  ...errors: string[]
): ValidationResult<T> {
  return {
    valid: false,
    errors,
  };
}

export function validateRequiredString(
  value: unknown,
  field: string,
): string | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    return `${field} is required`;
  }

  return undefined;
}

