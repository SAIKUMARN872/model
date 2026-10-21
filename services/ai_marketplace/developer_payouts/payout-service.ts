import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../shared/errors.js";
import { generateId, now } from "../shared/utils.js";

import {
  validateCreatePayoutInput,
  type CreatePayoutInput,
  type Payout,
  type PayoutListOptions,
  type UpdatePayoutInput,
} from "./payout-schema.js";

import {
  InMemoryPayoutRepository,
  type PayoutRepository,
} from "./payout-repository.js";

export class PayoutService {
  constructor(
    private readonly repository: PayoutRepository =
      new InMemoryPayoutRepository(),
  ) {}

  async create(input: CreatePayoutInput): Promise<Payout> {
    validateCreatePayoutInput(input);
    const timestamp = now();

    return this.repository.create({
      id: generateId("payout"),
      developerId: input.developerId.trim(),
      amount: input.amount,
      ...(input.listingId !== undefined
        ? { listingId: input.listingId.trim() }
        : {}),
      ...(input.installationId !== undefined
        ? { installationId: input.installationId.trim() }
        : {}),
      currency: input.currency?.trim().toUpperCase() || "USD",
      status: "pending",
      metadata: structuredClone(input.metadata ?? {}),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  async getById(id: string): Promise<Payout> {
    this.validateId(id);
    const payout = await this.repository.getById(id.trim());

    if (!payout) {
      throw new NotFoundError(`Payout ${id} not found`);
    }

    return payout;
  }

  async list(options: PayoutListOptions = {}): Promise<Payout[]> {
    if (
      options.developerId !== undefined &&
      (typeof options.developerId !== "string" ||
        options.developerId.trim().length === 0)
    ) {
      throw new ValidationError("Developer ID must not be empty");
    }

    return this.repository.list({
      ...options,
      ...(options.developerId !== undefined
        ? { developerId: options.developerId.trim() }
        : {}),
    });
  }

  async process(id: string): Promise<Payout> {
    const payout = await this.getById(id);

    if (payout.status !== "pending") {
      throw new ConflictError(
        "Only pending payouts can be processed",
      );
    }

    return this.updateRecord(id, { status: "processing" });
  }

  async markPaid(id: string): Promise<Payout> {
    const payout = await this.getById(id);

    if (payout.status !== "processing") {
      throw new ConflictError(
        "Only processing payouts can be marked paid",
      );
    }

    const paidAt = now();
    return this.updateRecord(id, {
      status: "paid",
      paidAt,
    });
  }

  async update(
    id: string,
    input: UpdatePayoutInput,
  ): Promise<Payout> {
    const payout = await this.getById(id);

    if (payout.status === "paid") {
      throw new ConflictError("Paid payouts cannot be updated");
    }

    if (input.status === "paid") {
      throw new ValidationError(
        "Use markPaid to mark a payout as paid",
      );
    }

    if (
      input.metadata !== undefined &&
      (typeof input.metadata !== "object" ||
        input.metadata === null ||
        Array.isArray(input.metadata))
    ) {
      throw new ValidationError("Payout metadata must be an object");
    }

    return this.updateRecord(id, {
      ...input,
      ...(input.metadata !== undefined
        ? { metadata: structuredClone(input.metadata) }
        : {}),
    });
  }

  async delete(id: string): Promise<void> {
    const payout = await this.getById(id);

    if (payout.status === "paid") {
      throw new ConflictError("Paid payouts cannot be deleted");
    }

    const deleted = await this.repository.delete(payout.id);

    if (!deleted) {
      throw new NotFoundError(`Payout ${id} not found`);
    }
  }

  private async updateRecord(
    id: string,
    input: UpdatePayoutInput & { paidAt?: Date },
  ): Promise<Payout> {
    const updated = await this.repository.update(id, {
      ...input,
      updatedAt: now(),
    });

    if (!updated) {
      throw new NotFoundError(`Payout ${id} not found`);
    }

    return updated;
  }

  private validateId(id: string): void {
    if (typeof id !== "string" || id.trim().length === 0) {
      throw new ValidationError("Payout ID is required");
    }
  }
}
