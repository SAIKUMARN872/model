export function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}
export function cloneRecord<T>(value: T): T {
  if (value instanceof Date) return cloneDate(value) as T;
  if (Array.isArray(value)) return value.map(item => cloneRecord(item)) as T;
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) result[key] = cloneRecord(item);
    return result as T;
  }
  return value;
}
export function isExpired(expiresAt?: Date, now = new Date()): boolean {
  return expiresAt !== undefined && expiresAt.getTime() <= now.getTime();
}
