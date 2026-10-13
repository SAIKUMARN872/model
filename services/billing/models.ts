export interface BillingCustomer {
    id: string;
    email: string;
    name: string;
    currency: string;
    status: "active" | "inactive" | "suspended";
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

export interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: "month" | "year";
    trialDays: number;
    active: boolean;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

export interface Subscription {
    id: string;
    customerId: string;
    planId: string;
    status:
        | "trialing"
        | "active"
        | "past_due"
        | "paused"
        | "canceled";
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialEnd?: Date;
    canceledAt?: Date;
    cancelAtPeriodEnd: boolean;
    quantity: number;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

export interface InvoiceLine {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    metadata: Record<string, unknown>;
}

export interface Invoice {
    id: string;
    customerId: string;
    subscriptionId?: string;
    number: string;
    status:
        | "draft"
        | "open"
        | "paid"
        | "void"
        | "uncollectible";
    currency: string;
    subtotal: number;
    tax: number;
    total: number;
    amountDue: number;
    amountPaid: number;
    dueDate: Date;
    lines: InvoiceLine[];
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

export interface Payment {
    id: string;
    customerId: string;
    invoiceId?: string;
    amount: number;
    currency: string;
    status:
        | "pending"
        | "succeeded"
        | "failed"
        | "refunded";
    provider: string;
    providerPaymentId?: string;
    failureReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Refund {
    id: string;
    paymentId: string;
    amount: number;
    reason?: string;
    status: "pending" | "succeeded" | "failed";
    createdAt: Date;
    updatedAt: Date;
}

export interface CreditBalance {
    customerId: string;
    balance: number;
    currency: string;
    updatedAt: Date;
}

export interface Wallet {
    customerId: string;
    balance: number;
    currency: string;
    updatedAt: Date;
}

export interface Transaction {
    id: string;
    customerId: string;
    type:
        | "charge"
        | "refund"
        | "credit"
        | "debit"
        | "payment";
    amount: number;
    currency: string;
    referenceId?: string;
    description?: string;
    createdAt: Date;
}

export interface UsageRecord {
    id: string;
    customerId: string;
    meter: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    timestamp: Date;
    metadata: Record<string, unknown>;
}
