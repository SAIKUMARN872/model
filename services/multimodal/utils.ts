export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function requireText(value: string, field: string): void {
  if (!value || !value.trim()) {
    throw new Error(`${field} is required`);
  }
}
