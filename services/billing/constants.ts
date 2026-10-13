export const BILLING_DEFAULTS = {
    CURRENCY: "USD",
    TAX_RATE: 0,
    INVOICE_DUE_DAYS: 30,
    TRIAL_DAYS: 0,
    PAYMENT_PROVIDER: "memory"
} as const;

export const BILLING_LIMITS = {
    MAX_DISCOUNT_PERCENT: 100,
    MAX_TAX_RATE: 1,
    MAX_QUANTITY: 1000000
} as const;
