export const BillingEventTypes = {
    CUSTOMER_CREATED:
        "customer.created",
    PLAN_CREATED:
        "plan.created",
    SUBSCRIPTION_CREATED:
        "subscription.created",
    SUBSCRIPTION_CANCELED:
        "subscription.canceled",
    INVOICE_CREATED:
        "invoice.created",
    INVOICE_PAID:
        "invoice.paid",
    PAYMENT_SUCCEEDED:
        "payment.succeeded",
    PAYMENT_REFUNDED:
        "payment.refunded"
} as const;
