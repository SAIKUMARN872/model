export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "paused"
  | "cancelled"
  | "expired";

export interface MarketplaceSubscription {
  id: string;
  tenantId: string;
  listingId: string;
  planId: string;
  status: SubscriptionStatus;
  quantity: number;
  price: number;
  currency: string;
  startedAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionInput {
  tenantId: string;
  listingId: string;
  planId: string;
  quantity?: number;
  price: number;
  currency?: string;
  periodDays?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateSubscriptionInput {
  quantity?: number;
  price?: number;
  status?: SubscriptionStatus;
  metadata?: Record<string, unknown>;
  currentPeriodEnd?: Date;
}

export interface SubscriptionListOptions {
  tenantId?: string;
  listingId?: string;
  status?: SubscriptionStatus;
}
