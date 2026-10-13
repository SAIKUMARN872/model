export interface ApiUsage {
  id: string;
  ownerId: string;
  apiKeyId?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  units: number;
  durationMs: number;
  createdAt: Date;
}

export interface CreateApiUsageInput {
  ownerId: string;
  apiKeyId?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  units?: number;
  durationMs?: number;
}

export function validateCreateApiUsageInput(input: CreateApiUsageInput): void {
  if (!input.ownerId.trim()) throw new Error("ownerId is required.");
  if (!input.endpoint.trim()) throw new Error("endpoint is required.");
  if (!input.method.trim()) throw new Error("method is required.");
  if (!Number.isInteger(input.statusCode) || input.statusCode < 100 || input.statusCode > 599) {
    throw new Error("statusCode must be an integer between 100 and 599.");
  }
  for (const [name, value] of [
    ["units", input.units ?? 1],
    ["durationMs", input.durationMs ?? 0],
  ] as const) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${name} must be a non-negative number.`);
    }
  }
}
