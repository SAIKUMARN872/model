export type BillingStatus = "active" | "inactive" | "suspended";

export type SubscriptionStatus =
    | "trialing"
    | "active"
    | "past_due"
    | "paused"
    | "canceled";

export type InvoiceStatus =
    | "draft"
    | "open"
    | "paid"
    | "void"
    | "uncollectible";

export type PaymentStatus =
    | "pending"
    | "succeeded"
    | "failed"
    | "refunded";

export type TransactionType =
    | "charge"
    | "refund"
    | "credit"
    | "debit"
    | "payment";

export interface CustomerInput {
    email: string;
    name: string;
    currency?: string;
    metadata?: Record<string, unknown>;
}

export interface PlanInput {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    interval?: "month" | "year";
    trialDays?: number;
    metadata?: Record<string, unknown>;
}

export interface BillingConfig {
    currency: string;
    taxRate: number;
    invoiceDueDays: number;
    defaultTrialDays: number;
    paymentProvider: string;
    allowNegativeWallet: boolean;
}
