import type {
  Payout,
  PayoutListOptions,
  PayoutStatus,
  UpdatePayoutInput,
} from "./payout-schema.js";

export interface PayoutRepository {
  create(payout: Payout): Promise<Payout>;
  getById(id: string): Promise<Payout | undefined>;
  list(options?: PayoutListOptions): Promise<Payout[]>;
  update(
    id: string,
    changes: UpdatePayoutInput & { paidAt?: Date; updatedAt?: Date },
  ): Promise<Payout | undefined>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryPayoutRepository implements PayoutRepository {
  private readonly payouts = new Map<string, Payout>();

  async create(payout: Payout): Promise<Payout> {
    if (this.payouts.has(payout.id)) {
      throw new Error(`Payout already exists: ${payout.id}`);
    }

    const copy = structuredClone(payout);
    this.payouts.set(copy.id, copy);
    return structuredClone(copy);
  }

  async getById(id: string): Promise<Payout | undefined> {
    const payout = this.payouts.get(id);
    return payout ? structuredClone(payout) : undefined;
  }

  async list(options: PayoutListOptions = {}): Promise<Payout[]> {
    return [...this.payouts.values()]
      .filter(
        (payout) =>
          options.developerId === undefined ||
          payout.developerId === options.developerId,
      )
      .filter(
        (payout) =>
          options.status === undefined ||
          payout.status === options.status,
      )
      .map((payout) => structuredClone(payout));
  }

  async update(
    id: string,
    changes: UpdatePayoutInput & { paidAt?: Date; updatedAt?: Date },
  ): Promise<Payout | undefined> {
    const existing = this.payouts.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: Payout = {
      ...existing,
      ...(changes.status !== undefined
        ? { status: changes.status }
        : {}),
      ...(changes.metadata !== undefined
        ? { metadata: structuredClone(changes.metadata) }
        : {}),
      ...(changes.paidAt !== undefined
        ? { paidAt: new Date(changes.paidAt) }
        : {}),
      updatedAt: changes.updatedAt
        ? new Date(changes.updatedAt)
        : new Date(),
    };

    this.payouts.set(id, updated);
    return structuredClone(updated);
  }

  async delete(id: string): Promise<boolean> {
    return this.payouts.delete(id);
  }
}

export type { PayoutStatus };
