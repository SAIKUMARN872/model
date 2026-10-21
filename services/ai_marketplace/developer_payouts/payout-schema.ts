import { ValidationError } from "../shared/errors.js";

export type PayoutStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled";

export interface CreatePayoutInput {
  developerId: string;
  amount: number;
  listingId?: string;
  installationId?: string;
  currency?: string;
  metadata?: Record<string, unknown>;
}

export interface Payout {
  id: string;
  developerId: string;
  amount: number;
  listingId?: string;
  installationId?: string;
  currency: string;
  status: PayoutStatus;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

export interface UpdatePayoutInput {
  status?: PayoutStatus;
  metadata?: Record<string, unknown>;
}

export interface PayoutListOptions {
  developerId?: string;
  status?: PayoutStatus;
}

export function validateCreatePayoutInput(
  input: CreatePayoutInput,
): void {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Payout input is required.");
  }

  if (
    typeof input.developerId !== "string" ||
    input.developerId.trim().length === 0
  ) {
    throw new ValidationError("Developer ID is required.");
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new ValidationError("Amount must be a positive number.");
  }

  if (
    input.currency !== undefined &&
    (typeof input.currency !== "string" ||
      !/^[A-Z]{3}$/.test(input.currency.trim().toUpperCase()))
  ) {
    throw new ValidationError("Currency must be a three-letter code.");
  }

  if (
    input.listingId !== undefined &&
    (typeof input.listingId !== "string" ||
      input.listingId.trim().length === 0)
  ) {
    throw new ValidationError("Listing ID must not be empty.");
  }

  if (
    input.installationId !== undefined &&
    (typeof input.installationId !== "string" ||
      input.installationId.trim().length === 0)
  ) {
    throw new ValidationError("Installation ID must not be empty.");
  }

  if (
    input.metadata !== undefined &&
    (typeof input.metadata !== "object" ||
      input.metadata === null ||
      Array.isArray(input.metadata))
  ) {
    throw new ValidationError("Payout metadata must be an object.");
  }
}
