import type {
  MarketplaceSubscription,
  SubscriptionListOptions,
  UpdateSubscriptionInput
} from "./subscription-schema.js";

export class SubscriptionRepository {
  private readonly subscriptions = new Map<
    string,
    MarketplaceSubscription
  >();

  async create(
    subscription: MarketplaceSubscription
  ): Promise<MarketplaceSubscription> {
    this.subscriptions.set(subscription.id, subscription);
    return structuredClone(subscription);
  }

  async getById(
    id: string
  ): Promise<MarketplaceSubscription | undefined> {
    const subscription = this.subscriptions.get(id);
    return subscription ? structuredClone(subscription) : undefined;
  }

  async findActive(
    tenantId: string,
    listingId: string
  ): Promise<MarketplaceSubscription | undefined> {
    for (const subscription of this.subscriptions.values()) {
      if (
        subscription.tenantId === tenantId &&
        subscription.listingId === listingId &&
        ["trialing", "active", "past_due", "paused"].includes(
          subscription.status
        )
      ) {
        return structuredClone(subscription);
      }
    }

    return undefined;
  }

  async list(
    options: SubscriptionListOptions = {}
  ): Promise<MarketplaceSubscription[]> {
    return [...this.subscriptions.values()]
      .filter((subscription) => {
        if (
          options.tenantId &&
          subscription.tenantId !== options.tenantId
        ) {
          return false;
        }

        if (
          options.listingId &&
          subscription.listingId !== options.listingId
        ) {
          return false;
        }

        if (
          options.status &&
          subscription.status !== options.status
        ) {
          return false;
        }

        return true;
      })
      .map((subscription) => structuredClone(subscription));
  }

  async update(
    id: string,
    input: UpdateSubscriptionInput
  ): Promise<MarketplaceSubscription | undefined> {
    const subscription = this.subscriptions.get(id);

    if (!subscription) {
      return undefined;
    }

    const updated: MarketplaceSubscription = {
      ...subscription,
      ...(input.quantity !== undefined
        ? { quantity: input.quantity }
        : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.status !== undefined
        ? { status: input.status }
        : {}),
      ...(input.metadata !== undefined
        ? { metadata: structuredClone(input.metadata) }
        : {}),
      ...(input.currentPeriodEnd !== undefined
        ? { currentPeriodEnd: new Date(input.currentPeriodEnd) }
        : {}),
      updatedAt: new Date()
    };

    if (
      updated.status === "cancelled" &&
      !updated.cancelledAt
    ) {
      updated.cancelledAt = new Date();
    }

    this.subscriptions.set(id, updated);

    return structuredClone(updated);
  }

  async delete(id: string): Promise<boolean> {
    return this.subscriptions.delete(id);
  }

  async clear(): Promise<void> {
    this.subscriptions.clear();
  }
}
