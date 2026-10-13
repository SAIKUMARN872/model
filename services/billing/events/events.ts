export interface BillingEvent {
    id: string;
    type: string;
    customerId?: string;
    subscriptionId?: string;
    invoiceId?: string;
    paymentId?: string;
    data: Record<string, unknown>;
    createdAt: Date;
}
