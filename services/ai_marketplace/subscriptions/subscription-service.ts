import {
  ConflictError,
  NotFoundError,
  ValidationError
} from "../shared/errors.js";
import { generateId, now } from "../shared/utils.js";
import { SubscriptionRepository } from "./subscription-repository.js";
import type {
  CreateSubscriptionInput,
  MarketplaceSubscription,
  SubscriptionListOptions,
  UpdateSubscriptionInput
} from "./subscription-schema.js";

export class SubscriptionService {
  constructor(
    private readonly repository: SubscriptionRepository =
      new SubscriptionRepository()
  ) {}

  async create(
    input: CreateSubscriptionInput
  ): Promise<MarketplaceSubscription> {
    if (!input.tenantId?.trim()) {
      throw new ValidationError("tenantId is required");
    }

    if (!input.listingId?.trim()) {
      throw new ValidationError("listingId is required");
    }

    if (!input.planId?.trim()) {
      throw new ValidationError("planId is required");
    }

    if (!Number.isFinite(input.price) || input.price < 0) {
      throw new ValidationError("price must be zero or greater");
    }

    const quantity = input.quantity ?? 1;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ValidationError("quantity must be a positive integer");
    }

    const currency = input.currency?.trim().toUpperCase() || "USD";

    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new ValidationError("currency must be a 3-letter code");
    }

    const existing = await this.repository.findActive(
      input.tenantId,
      input.listingId
    );

    if (existing) {
      throw new ConflictError(
        "An active subscription already exists for this listing"
      );
    }

    const timestamp = now();
    const periodDays = input.periodDays ?? 30;

    if (!Number.isInteger(periodDays) || periodDays <= 0) {
      throw new ValidationError(
        "periodDays must be a positive integer"
      );
    }

    const periodEnd = new Date(timestamp);
    periodEnd.setDate(periodEnd.getDate() + periodDays);

    const subscription: MarketplaceSubscription = {
      id: generateId("subscription"),
      tenantId: input.tenantId.trim(),
      listingId: input.listingId.trim(),
      planId: input.planId.trim(),
      status: "active",
      quantity,
      price: input.price,
      currency,
      startedAt: timestamp,
      currentPeriodStart: timestamp,
      currentPeriodEnd: periodEnd,
      metadata: structuredClone(input.metadata ?? {}),
      createdAt: timestamp,
      updatedAt: timestamp
    };

    return this.repository.create(subscription);
  }

  async getById(id: string): Promise<MarketplaceSubscription> {
    const subscription = await this.repository.getById(id);

    if (!subscription) {
      throw new NotFoundError(`Subscription ${id} not found`);
    }

    return subscription;
  }

  async list(
    options: SubscriptionListOptions = {}
  ): Promise<MarketplaceSubscription[]> {
    return this.repository.list(options);
  }

  async update(
    id: string,
    input: UpdateSubscriptionInput
  ): Promise<MarketplaceSubscription> {
    const subscription = await this.getById(id);

    if (subscription.status === "cancelled") {
      throw new ConflictError(
        "Cancelled subscriptions cannot be updated"
      );
    }

    if (
      input.quantity !== undefined &&
      (!Number.isInteger(input.quantity) || input.quantity <= 0)
    ) {
      throw new ValidationError(
        "quantity must be a positive integer"
      );
    }

    if (input.price !== undefined && input.price < 0) {
      throw new ValidationError("price cannot be negative");
    }

    const updated = await this.repository.update(id, input);

    if (!updated) {
      throw new NotFoundError(`Subscription ${id} not found`);
    }

    return updated;
  }

  async pause(id: string): Promise<MarketplaceSubscription> {
    const subscription = await this.getById(id);

    if (!["active", "trialing"].includes(subscription.status)) {
      throw new ConflictError(
        "Only active subscriptions can be paused"
      );
    }

    return this.update(id, { status: "paused" });
  }

  async resume(id: string): Promise<MarketplaceSubscription> {
    const subscription = await this.getById(id);

    if (subscription.status !== "paused") {
      throw new ConflictError(
        "Only paused subscriptions can be resumed"
      );
    }

    return this.update(id, { status: "active" });
  }

  async markPastDue(id: string): Promise<MarketplaceSubscription> {
    const subscription = await this.getById(id);

    if (!["active", "trialing"].includes(subscription.status)) {
      throw new ConflictError(
        "Only active subscriptions can become past due"
      );
    }

    return this.update(id, { status: "past_due" });
  }

  async cancel(id: string): Promise<MarketplaceSubscription> {
    const subscription = await this.getById(id);

    if (subscription.status === "cancelled") {
      return subscription;
    }

    if (subscription.status === "expired") {
      throw new ConflictError(
        "Expired subscriptions cannot be cancelled"
      );
    }

    return this.update(id, { status: "cancelled" });
  }

  async expire(id: string): Promise<MarketplaceSubscription> {
    const subscription = await this.getById(id);

    if (subscription.status === "cancelled") {
      throw new ConflictError(
        "Cancelled subscriptions cannot expire"
      );
    }

    return this.update(id, { status: "expired" });
  }

  async renew(
    id: string,
    periodDays = 30
  ): Promise<MarketplaceSubscription> {
    if (!Number.isInteger(periodDays) || periodDays <= 0) {
      throw new ValidationError(
        "periodDays must be a positive integer"
      );
    }

    const subscription = await this.getById(id);

    if (["cancelled", "expired"].includes(subscription.status)) {
      throw new ConflictError(
        "Cancelled or expired subscriptions cannot be renewed"
      );
    }

    const periodStart = new Date(subscription.currentPeriodEnd);
    const periodEnd = new Date(periodStart);

    periodEnd.setDate(periodEnd.getDate() + periodDays);

    return this.update(id, {
      status: "active",
      currentPeriodEnd: periodEnd
    }).then((updated) => ({
      ...updated,
      currentPeriodStart: periodStart
    }));
  }

  async delete(id: string): Promise<void> {
    const subscription = await this.getById(id);

    if (["active", "trialing", "past_due", "paused"].includes(subscription.status)) {
      throw new ConflictError(
        "Active subscriptions must be cancelled before deletion"
      );
    }

    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundError(`Subscription ${id} not found`);
    }
  }
}
